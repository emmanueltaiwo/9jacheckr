import type { Metadata } from 'next';
import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';
import { VerifyLookupClient } from '@/components/verify-lookup-client';

export const metadata: Metadata = {
  title: 'Verify a product · 9ja Checkr',
  description:
    'Free lookup: enter a NAFDAC registration number. We show details from the public registration channel (responses may be cached). No account required.',
};

export default function VerifyPage() {
  return (
    <div
      className="min-h-dvh w-full min-w-0 overflow-x-hidden"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      <SiteNav />

      <main className="relative mx-auto max-w-2xl min-w-0 px-4 pb-16 pt-32 sm:px-6 sm:pt-36">
        <div
          className="pointer-events-none absolute left-1/2 top-20 h-[400px] w-[600px] -translate-x-1/2 rounded-full opacity-[0.045] blur-[80px]"
          style={{ background: 'var(--accent)' }}
          aria-hidden
        />

        <div className="relative">
          <div className="mb-10 text-center">
            <div
              className="mb-5 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12px] font-medium"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text-2)',
                background: 'var(--bg-raised)',
              }}
            >
              <span
                className="h-1.5 w-1.5 animate-pulse rounded-full"
                style={{ background: 'var(--accent)' }}
                aria-hidden
              />
              Free on this page · No sign-in
            </div>

            <h1 className="text-[clamp(2rem,6vw,3rem)] font-bold leading-[1.08] tracking-[-0.04em] text-foreground">
              Is this product{' '}
              <span style={{ color: 'var(--accent)' }}>on the register?</span>
            </h1>

            <p
              className="mx-auto mt-4 max-w-md text-[15px] leading-relaxed"
              style={{ color: 'var(--text-2)' }}
            >
              Enter the number from the packaging. We show name, manufacturer,
              and dates as returned from the public NAFDAC registration lookup
              flow — results may be cached. Not an official government check;
              see the{' '}
              <a
                href="/disclaimer"
                className="font-medium text-(--accent) underline underline-offset-2 transition-colors hover:text-(--accent-hover)"
              >
                disclaimer
              </a>
              .
            </p>
          </div>

          <VerifyLookupClient />
        </div>
      </main>

      <SiteFooter />
    </div>
  );
}
