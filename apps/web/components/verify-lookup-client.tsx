'use client';

import { useId, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Loader2,
  Search,
  ShieldCheck,
} from 'lucide-react';
import Link from 'next/link';

type ProductJson = {
  nafdac: string;
  name: string;
  category: string;
  source: string;
  manufacturer: string;
  approvedDate: string | null;
  expiryDate: string | null;
  ingredients: string[];
};

type SuccessJson = { ok: true; product: ProductJson };
type ErrorJson = { ok: false; code: string; message: string };

function formatDateLabel(iso: string | null): string {
  if (!iso) return 'Not listed';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Not listed';
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

function expiryNotice(iso: string | null): {
  tone: 'expired' | 'soon' | null;
  text: string;
} {
  if (!iso) return { tone: null, text: '' };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { tone: null, text: '' };
  const now = new Date();
  if (d < now) {
    return {
      tone: 'expired',
      text: 'This registration’s expiry date has passed. Treat the record as historical and confirm on packaging.',
    };
  }
  const days = (d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24);
  if (days <= 120) {
    return {
      tone: 'soon',
      text: `Expires in about ${Math.max(1, Math.ceil(days))} days — double-check the label before you buy.`,
    };
  }
  return { tone: null, text: '' };
}

function DetailCard({ label, value }: { label: string; value: string }) {
  return (
    <div
      className="rounded-xl border p-4 sm:p-5"
      style={{
        borderColor: 'var(--border-subtle)',
        background: 'rgba(0,0,0,0.28)',
      }}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-(--text-3)">
        {label}
      </p>
      <p className="mt-2 text-[15px] font-medium leading-snug text-foreground">
        {value}
      </p>
    </div>
  );
}

export function VerifyLookupClient() {
  const formId = useId();
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [product, setProduct] = useState<ProductJson | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) {
      setErrorMessage('Enter the number from the product label.');
      setProduct(null);
      return;
    }
    setLoading(true);
    setErrorMessage(null);
    setProduct(null);

    try {
      const res = await fetch('/api/verify-lookup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nafdac: trimmed }),
      });
      const data = (await res.json()) as SuccessJson | ErrorJson;

      if (!res.ok || !data.ok) {
        const msg =
          data.ok === false && data.message
            ? data.message
            : 'Something went wrong. Try again shortly.';
        setErrorMessage(msg);
        return;
      }

      setProduct(data.product);
    } catch {
      setErrorMessage(
        'We could not reach the server. Check your connection and try again.',
      );
    } finally {
      setLoading(false);
    }
  }

  const exp = product
    ? expiryNotice(product.expiryDate)
    : { tone: null, text: '' };

  return (
    <div className="min-w-0 space-y-8">
      <form
        id={formId}
        onSubmit={(e) => void onSubmit(e)}
        className="relative min-w-0"
      >
        <label htmlFor={`${formId}-input`} className="sr-only">
          NAFDAC registration number
        </label>
        <div
          className="flex min-w-0 flex-col gap-3 rounded-2xl border p-2 sm:flex-row sm:items-stretch sm:p-2.5 sm:pr-2.5"
          style={{
            borderColor: 'var(--border)',
            background:
              'linear-gradient(180deg, rgba(255,255,255,0.04) 0%, rgba(0,0,0,0.2) 100%)',
            boxShadow: '0 0 0 1px rgba(0,0,0,0.4) inset',
          }}
        >
          <div className="relative flex min-h-[52px] min-w-0 flex-1 items-center gap-3 px-3 sm:px-4">
            <Search
              className="h-5 w-5 shrink-0 text-(--text-3)"
              strokeWidth={1.75}
              aria-hidden
            />
            <input
              id={`${formId}-input`}
              type="text"
              inputMode="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="Type or paste NAFDAC number…"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={loading}
              className="min-w-0 flex-1 bg-transparent py-2 font-mono text-[16px] text-foreground outline-none placeholder:text-(--text-3) disabled:opacity-50 sm:text-[17px]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="inline-flex h-[52px] shrink-0 items-center justify-center gap-2 rounded-xl bg-[var(--accent)] px-6 text-[15px] font-semibold text-black transition hover:bg-[var(--accent-hover)] focus-visible-ring disabled:cursor-not-allowed disabled:opacity-45 sm:h-auto sm:min-w-[148px]"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
                Checking
              </>
            ) : (
              <>
                Look up
                <ArrowRight className="h-4 w-4" aria-hidden />
              </>
            )}
          </button>
        </div>
        <p
          className="mt-3 text-center text-[13px] sm:text-left"
          style={{ color: 'var(--text-3)' }}
        >
          Examples:{' '}
          <button
            type="button"
            className="font-mono text-[12px] text-(--text-2) underline decoration-(--border) underline-offset-4 transition hover:text-[var(--accent)]"
            onClick={() => setValue('01-5713')}
          >
            01-5713
          </button>
        </p>
      </form>

      {errorMessage ? (
        <div
          className="flex gap-3 rounded-2xl border px-4 py-4 sm:px-5"
          style={{
            borderColor: 'rgba(251, 191, 36, 0.25)',
            background: 'rgba(251, 191, 36, 0.06)',
          }}
          role="alert"
        >
          <AlertCircle
            className="mt-0.5 h-5 w-5 shrink-0 text-amber-400/95"
            aria-hidden
          />
          <p className="text-[14px] leading-relaxed text-(--text-2)">
            {errorMessage}
          </p>
        </div>
      ) : null}

      {product ? (
        <div className="verify-result-reveal min-w-0">
          {exp.tone ? (
            <div
              className="mb-4 rounded-xl border px-4 py-3 text-[13px] leading-relaxed"
              style={{
                borderColor:
                  exp.tone === 'expired'
                    ? 'rgba(248, 113, 113, 0.3)'
                    : 'rgba(251, 191, 36, 0.25)',
                background:
                  exp.tone === 'expired'
                    ? 'rgba(248, 113, 113, 0.06)'
                    : 'rgba(251, 191, 36, 0.06)',
                color: 'var(--text-2)',
              }}
            >
              {exp.text}
            </div>
          ) : null}

          <div
            className="overflow-hidden rounded-2xl border"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--bg-subtle)',
            }}
          >
            <div
              className="border-b px-5 py-6 sm:px-8 sm:py-8"
              style={{
                borderColor: 'var(--border-subtle)',
                background: 'var(--verify-result-header-gradient)',
              }}
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-full"
                      style={{
                        background: 'var(--get-badge-bg)',
                        color: 'var(--get-badge-fg)',
                      }}
                    >
                      <CheckCircle2 className="h-5 w-5" strokeWidth={2} />
                    </span>
                    <span className="text-[12px] font-semibold uppercase tracking-wider text-(--text-3)">
                      On the register
                    </span>
                  </div>
                  <h2 className="mt-4 font-display text-[1.5rem] font-semibold leading-tight tracking-[-0.03em] text-foreground sm:text-[1.75rem]">
                    {product.name}
                  </h2>
                  <p className="mt-2 font-mono text-[13px] text-(--text-2)">
                    {product.nafdac}
                  </p>
                </div>
                <div
                  className="flex shrink-0 items-center gap-2 rounded-lg border px-3 py-2 text-[12px] text-(--text-2)"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    background: 'var(--verify-meta-pill-bg)',
                  }}
                >
                  <ShieldCheck
                    className="h-4 w-4 shrink-0 opacity-90"
                    style={{ color: 'var(--accent)' }}
                    strokeWidth={2}
                  />
                  NAFDAC register
                </div>
              </div>
            </div>

            <div className="grid gap-3 p-4 sm:grid-cols-2 sm:gap-4 sm:p-6">
              <DetailCard
                label="Manufacturer"
                value={product.manufacturer || '—'}
              />
              <DetailCard label="Category" value={product.category || '—'} />
              <DetailCard
                label="Approved"
                value={formatDateLabel(product.approvedDate)}
              />
              <DetailCard
                label="Expiry"
                value={formatDateLabel(product.expiryDate)}
              />
            </div>

            {product.source ? (
              <div
                className="border-t px-4 py-3 sm:px-6"
                style={{
                  borderColor: 'var(--border-subtle)',
                  background: 'rgba(0,0,0,0.15)',
                }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider text-(--text-3)">
                  Source
                </p>
                <p className="mt-1 text-[13px] text-(--text-2)">
                  {product.source}
                </p>
              </div>
            ) : null}

            {product.ingredients.length > 0 ? (
              <div
                className="border-t px-4 py-5 sm:px-6 sm:py-6"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider text-(--text-3)">
                  Ingredients
                </p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {product.ingredients.map((ing, idx) => (
                    <li
                      key={`${ing}-${idx}`}
                      className="rounded-lg border px-3 py-1.5 font-mono text-[12px] text-(--text-2)"
                      style={{
                        borderColor: 'var(--border-subtle)',
                        background: 'rgba(0,0,0,0.2)',
                      }}
                    >
                      {ing}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <p
              className="border-t px-4 py-4 text-[12px] leading-relaxed sm:px-6"
              style={{
                borderColor: 'var(--border-subtle)',
                color: 'var(--text-3)',
              }}
            >
              Data is fetched from the official NAFDAC product register. Always
              match what you see on the pack and buy from sellers you trust.
            </p>
          </div>

          <p className="mt-6 text-center text-[13px] text-(--text-3) sm:text-left">
            Building an app?{' '}
            <Link
              href="/login?next=/dashboard"
              className="font-medium text-[var(--accent)] underline underline-offset-4 transition-colors hover:text-[var(--accent-hover)]"
            >
              Get an API key
            </Link>{' '}
            for automated checks.
          </p>
        </div>
      ) : null}
    </div>
  );
}
