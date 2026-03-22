import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteNav } from '@/components/site-nav';

export const metadata: Metadata = {
  title: 'Telegram Bot Pro · Payment received · 9ja Checkr',
  description:
    'Return to the 9ja Checkr Telegram bot after subscribing to Bot Pro.',
};

function pick(
  v: string | string[] | undefined,
): string | null {
  if (v == null) return null;
  const s = Array.isArray(v) ? v[0] : v;
  const t = typeof s === 'string' ? s.trim() : '';
  return t.length > 0 ? t : null;
}

type PageProps = {
  searchParams: Promise<{
    reference?: string | string[];
    trxref?: string | string[];
    via?: string | string[];
  }>;
};

export default async function BotBillingSuccessPage({
  searchParams,
}: PageProps) {
  const sp = await searchParams;
  const reference = pick(sp.reference);
  const trxref = pick(sp.trxref);
  const viaTelegram = pick(sp.via)?.toLowerCase() === 'telegram';

  return (
    <div className="page-bg min-h-dvh w-full min-w-0 overflow-x-hidden text-foreground">
      <SiteNav />

      <main className="relative mx-auto max-w-[560px] min-w-0 px-5 pb-24 pt-14 sm:px-6 sm:pb-28 sm:pt-20">
        <h1 className="font-display text-[1.65rem] font-semibold tracking-[-0.03em]">
          Payment complete
        </h1>
        <p
          className="mt-3 text-[15px] leading-relaxed"
          style={{ color: 'var(--text-2)' }}
        >
          {viaTelegram ? (
            <>
              If Paystack confirmed your subscription, Bot Pro should activate
              shortly. Open the bot and run{' '}
              <code className="font-mono text-[14px]">/status</code> to
              confirm your plan, total lookups, and today’s usage — limits refresh on the next check.
            </>
          ) : (
            <>
              If you subscribed via the Telegram bot, you can close this tab and
              return to Telegram.
            </>
          )}
        </p>

        {(reference || trxref) && (
          <div
            className="mt-8 rounded-xl border p-5 text-[13px]"
            style={{
              borderColor: 'var(--border-subtle)',
              background: 'var(--bg-subtle)',
            }}
          >
            <p
              className="text-[11px] font-medium uppercase tracking-[0.12em]"
              style={{ color: 'var(--text-3)' }}
            >
              Paystack reference (for support)
            </p>
            {reference ? (
              <p className="mt-2 font-mono text-[13px] break-all text-foreground">
                {reference}
              </p>
            ) : null}
            {trxref && trxref !== reference ? (
              <p className="mt-2 font-mono text-[12px] break-all text-(--text-2)">
                <span style={{ color: 'var(--text-3)' }}>trxref: </span>
                {trxref}
              </p>
            ) : null}
          </div>
        )}

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <a
            href="https://t.me/NaijaCheckrBot"
            target="_blank"
            rel="noopener noreferrer"
            className="btn-primary inline-flex h-10 items-center justify-center px-5 text-[13px] font-semibold"
          >
            Open Telegram bot
          </a>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center rounded-md border border-(--border) px-5 text-[13px] font-medium text-(--text-2) transition-colors hover:bg-(--bg-subtle)"
          >
            Back to home
          </Link>
        </div>
      </main>
    </div>
  );
}
