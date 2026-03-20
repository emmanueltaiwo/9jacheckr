import { cookies, headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { getAuth } from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Signed-in users on the web origin have a session cookie here, but not on api.*.
 * Expose the session token once so the client can send Authorization: Bearer to the API.
 */
export async function GET() {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) {
    return NextResponse.json({ ok: false }, { status: 401 });
  }

  const jar = await cookies();
  const sessionCookie = jar
    .getAll()
    .find((c) => c.name.includes('session_token'));

  if (!sessionCookie?.value) {
    return NextResponse.json({ ok: false }, { status: 404 });
  }

  return NextResponse.json({ ok: true, token: sessionCookie.value });
}
