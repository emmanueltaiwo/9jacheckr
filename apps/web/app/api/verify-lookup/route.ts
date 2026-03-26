import { NextRequest, NextResponse } from 'next/server';
import { isNafdacUnavailableClient } from '@/lib/nafdac-availability';
import { isPlausibleNafdacCertificate } from '@/lib/nafdac-validation';

export const dynamic = 'force-dynamic';

function parseAllowedHost(webAppUrl: string): string | null {
  try {
    return new URL(webAppUrl).hostname;
  } catch {
    return null;
  }
}

function originLooksLikeOurSite(
  origin: string | null,
  referer: string | null,
  allowedHost: string,
): boolean {
  const candidates = [origin, referer].filter(Boolean) as string[];
  for (const url of candidates) {
    try {
      const host = new URL(url).hostname;
      if (host === allowedHost) return true;
      if (host === `www.${allowedHost}`) return true;
      if (allowedHost.startsWith('www.') && host === allowedHost.slice(4))
        return true;
    } catch {
      /* ignore */
    }
  }
  return false;
}

export async function POST(req: NextRequest) {
  if (isNafdacUnavailableClient()) {
    return NextResponse.json(
      {
        ok: false,
        code: 'NAFDAC_UNAVAILABLE',
        message:
          'NAFDAC verification is temporarily unavailable while we adapt to upstream changes. Please try again later.',
      },
      { status: 503 },
    );
  }

  const secret = process.env.WEB_VERIFY_INTERNAL_SECRET?.trim() ?? '';
  const apiBase = (
    process.env.API_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    ''
  ).replace(/\/$/, '');

  if (!secret || !apiBase) {
    return NextResponse.json(
      {
        ok: false,
        code: 'SERVICE_UNAVAILABLE',
        message: 'Lookups are temporarily unavailable.',
      },
      { status: 503 },
    );
  }

  const webAppUrl = process.env.WEB_APP_URL?.trim() ?? '';
  if (webAppUrl && process.env.NODE_ENV === 'production') {
    const allowedHost = parseAllowedHost(webAppUrl);
    if (allowedHost) {
      const secFetch = req.headers.get('sec-fetch-site');
      const fromOurSpa = secFetch === 'same-origin';
      if (!fromOurSpa) {
        const origin = req.headers.get('origin');
        const referer = req.headers.get('referer');
        if (!originLooksLikeOurSite(origin, referer, allowedHost)) {
          return NextResponse.json(
            { ok: false, code: 'FORBIDDEN', message: 'Forbidden' },
            { status: 403 },
          );
        }
      }
    }
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json(
      { ok: false, code: 'BAD_REQUEST', message: 'Invalid request body.' },
      { status: 400 },
    );
  }

  const raw =
    typeof body === 'object' &&
    body !== null &&
    'nafdac' in body &&
    typeof (body as { nafdac: unknown }).nafdac === 'string'
      ? (body as { nafdac: string }).nafdac.trim()
      : '';

  if (!raw) {
    return NextResponse.json(
      {
        ok: false,
        code: 'INVALID_NAFDAC',
        message: 'Enter a NAFDAC registration number.',
      },
      { status: 400 },
    );
  }

  if (!isPlausibleNafdacCertificate(raw)) {
    return NextResponse.json(
      {
        ok: false,
        code: 'INVALID_NAFDAC',
        message: 'Invalid NAFDAC registration number format.',
      },
      { status: 400 },
    );
  }

  const encoded = encodeURIComponent(raw);
  const upstream = await fetch(`${apiBase}/api/public/verify/${encoded}`, {
    method: 'GET',
    headers: { 'x-web-verify-internal': secret },
    cache: 'no-store',
  });

  const text = await upstream.text();
  const ct = upstream.headers.get('content-type') ?? 'application/json';

  return new NextResponse(text, {
    status: upstream.status,
    headers: { 'Content-Type': ct },
  });
}
