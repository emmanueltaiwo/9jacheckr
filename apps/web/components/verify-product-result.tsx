import Link from 'next/link';
import { AlertCircle, CheckCircle2, ShieldCheck } from 'lucide-react';

export type ProductJson = {
  nafdac: string;
  name: string;
  category: string;
  source: string;
  manufacturer: string;
  approvedDate: string | null;
  expiryDate: string | null;
  ingredients: string[];
};

export type SuccessJson = { ok: true; product: ProductJson };
export type ErrorJson = { ok: false; code: string; message: string };

export function formatDateLabel(iso: string | null): string {
  if (!iso) return 'Not listed';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Not listed';
  return new Intl.DateTimeFormat(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d);
}

function relativeTimePast(past: Date, now: Date): string {
  const dayMs = 86_400_000;
  const totalDays = Math.floor((now.getTime() - past.getTime()) / dayMs);
  if (totalDays < 1) return 'less than a day ago';
  if (totalDays === 1) return '1 day ago';
  if (totalDays < 7) return `${totalDays} days ago`;

  const weeks = Math.floor(totalDays / 7);
  if (totalDays < 30) {
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }

  let months =
    (now.getFullYear() - past.getFullYear()) * 12 +
    (now.getMonth() - past.getMonth());
  if (now.getDate() < past.getDate()) months -= 1;
  if (months < 1) {
    return weeks === 1 ? '1 week ago' : `${weeks} weeks ago`;
  }
  if (months < 12) {
    return months === 1 ? '1 month ago' : `${months} months ago`;
  }

  const years = Math.floor(months / 12);
  return years === 1 ? '1 year ago' : `${years} years ago`;
}

export function formatExpiryDetail(iso: string | null): string {
  const label = formatDateLabel(iso);
  if (!iso) return label;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return label;
  const now = new Date();
  if (d >= now) return label;
  return `${label} · expired ${relativeTimePast(d, now)}`;
}

export function expiryNotice(iso: string | null): {
  tone: 'expired' | 'soon' | null;
  text: string;
} {
  if (!iso) return { tone: null, text: '' };
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return { tone: null, text: '' };
  const now = new Date();
  if (d < now) {
    const when = relativeTimePast(d, now);
    return {
      tone: 'expired',
      text: `This registration expired ${when} (${formatDateLabel(iso)}). Treat the record as historical and confirm on packaging.`,
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
        background: 'var(--bg-overlay)',
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

export function VerifyErrorBanner({ message }: { message: string }) {
  return (
    <div
      className="flex gap-3 rounded-2xl border px-4 py-4 sm:px-5"
      style={{
        borderColor: 'var(--callout-warning-border)',
        background: 'var(--callout-warning-bg)',
      }}
      role="alert"
    >
      <AlertCircle
        className="mt-0.5 h-5 w-5 shrink-0"
        style={{ color: 'var(--callout-warning-icon)' }}
        aria-hidden
      />
      <p
        className="text-[14px] leading-relaxed"
        style={{ color: 'var(--callout-warning-fg)' }}
      >
        {message}
      </p>
    </div>
  );
}

export function ProductResultView({
  product,
  showDevCta = true,
  className = '',
}: {
  product: ProductJson;
  showDevCta?: boolean;
  className?: string;
}) {
  const exp = expiryNotice(product.expiryDate);

  return (
    <div className={`verify-result-reveal min-w-0 ${className}`}>
      {exp.tone ? (
        <div
          className="mb-4 rounded-xl border px-4 py-3 text-[13px] leading-relaxed"
          style={{
            borderColor:
              exp.tone === 'expired'
                ? 'rgba(248, 113, 113, 0.3)'
                : 'var(--callout-warning-border)',
            background:
              exp.tone === 'expired'
                ? 'rgba(248, 113, 113, 0.06)'
                : 'var(--callout-warning-bg)',
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
                  Register lookup match
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
              Public register data
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
            value={formatExpiryDetail(product.expiryDate)}
          />
        </div>

        {product.source ? (
          <div
            className="border-t px-4 py-3 sm:px-6"
            style={{
              borderColor: 'var(--border-subtle)',
              background: 'var(--bg-overlay)',
            }}
          >
            <p className="text-[11px] font-semibold uppercase tracking-wider text-(--text-3)">
              Source
            </p>
            <p className="mt-1 text-[13px] text-(--text-2)">{product.source}</p>
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
                    background: 'var(--bg-overlay)',
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
          We automate NAFDAC&apos;s public lookup flow; results may be cached.
          Not affiliated with NAFDAC — see our{' '}
          <Link
            href="/disclaimer"
            className="font-medium text-(--accent) underline underline-offset-2 transition-colors hover:text-(--accent-hover)"
          >
            disclaimer
          </Link>
          . Always match what you see on the pack and buy from sellers you
          trust.
        </p>
      </div>

      {showDevCta ? (
        <p className="mt-6 text-center text-[13px] text-(--text-3) sm:text-left">
          Building an app?{' '}
          <Link
            href="/login?next=/dashboard"
            className="font-medium text-(--accent) underline underline-offset-4 transition-colors hover:text-(--accent-hover)"
          >
            Get an API key
          </Link>{' '}
          for automated lookups.
        </p>
      ) : null}
    </div>
  );
}
