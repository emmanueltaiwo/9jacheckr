import type { Metadata } from 'next';
import Link from 'next/link';
import { SiteNav } from '@/components/site-nav';
import { VerifyLookupClient } from '@/components/verify-lookup-client';

export const metadata: Metadata = {
  title: 'Verify a NAFDAC number · 9ja Checkr',
  description:
    'Free lookup: enter a NAFDAC registration number and see product details from the official register. No account required.',
};

export default function VerifyPage() {
  return (
    <div className="page-bg min-h-dvh w-full min-w-0 overflow-x-hidden text-foreground">
      <SiteNav />

      <main className="relative mx-auto max-w-[720px] min-w-0 px-5 pb-24 pt-14 sm:px-6 sm:pb-28 sm:pt-20">
        <div
          className="dot-grid dot-grid-fade pointer-events-none absolute inset-0 left-1/2 max-w-[900px] -translate-x-1/2"
          aria-hidden
        />
        <div
          className="glow-lime pointer-events-none absolute -top-24 left-1/2 h-88 w-88 max-w-[min(100%,24rem)] -translate-x-1/2 opacity-80"
          aria-hidden
        />

        <div className="relative text-center sm:text-left">
          <div className="anim inline-flex justify-center sm:justify-start">
            <span
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1 font-mono text-[11px]"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text-2)',
                background: 'var(--bg-subtle)',
              }}
            >
              <span
                className="h-1.5 w-1.5 rounded-full"
                style={{ background: 'var(--accent)' }}
              />
              Free · no sign-in
            </span>
          </div>

          <h1 className="anim anim-d1 mt-6 font-display text-[2rem] font-semibold leading-[1.08] tracking-[-0.035em] sm:text-[2.5rem]">
            Is this product
            <br className="hidden sm:block" />{' '}
            <span className="text-(--text-2)">on the NAFDAC register?</span>
          </h1>

          <p
            className="anim anim-d2 mx-auto mt-5 max-w-[460px] text-[16px] leading-[1.7] sm:mx-0"
            style={{ color: 'var(--text-2)' }}
          >
            Enter the registration number from the pack.
          </p>
        </div>

        <div className="anim anim-d3 relative mt-12 min-w-0">
          <VerifyLookupClient />
        </div>

        <nav
          className="anim anim-d4 relative mt-16 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 border-t pt-10 text-[13px] sm:justify-start"
          style={{
            borderColor: 'var(--border-subtle)',
            color: 'var(--text-3)',
          }}
          aria-label="Footer"
        >
          <Link href="/" className="transition-colors hover:text-foreground">
            ← Home
          </Link>
          <Link
            href="/#api"
            className="transition-colors hover:text-foreground"
          >
            API docs
          </Link>
          <a
            href="https://t.me/NaijaCheckrBot"
            target="_blank"
            rel="noopener noreferrer"
            className="transition-colors hover:text-foreground"
          >
            Telegram bot
          </a>
        </nav>
      </main>
    </div>
  );
}
