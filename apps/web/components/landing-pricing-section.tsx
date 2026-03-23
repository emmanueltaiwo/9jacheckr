import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';

const API_TIERS = [
  {
    name: 'Free',
    price: '₦0',
    period: 'forever',
    description: 'Build and test integrations.',
    features: [
      '300 API uses / month (single verify only — no batch or search)',
      '1 API key',
      'Lower per-window rate limits vs Pro',
      'No detailed dashboard metrics',
    ],
    highlighted: false,
    cta: 'Start free',
    ctaHref: '/dashboard/keys',
  },
  {
    name: 'API Pro',
    price: '₦10,000',
    period: '/ month',
    description: 'Production apps, teams, and commercial use.',
    features: [
      '50,000 API uses / month (verify rows + successful product search)',
      'Multiple API keys',
      'Higher per-window rate limits than Free',
      'Full usage metrics in dashboard',
      'Batch verify & product search (Pro only)',
      'Commercial use included',
    ],
    highlighted: true,
    cta: 'Upgrade in dashboard',
    ctaHref: '/dashboard/keys',
  },
] as const;

const BOT_TIERS = [
  {
    name: 'Free',
    price: '₦0',
    body: '5 Telegram checks per day — perfect for occasional lookups.',
  },
  {
    name: 'Bot Pro',
    price: '₦1,000',
    period: '/ month',
    body: 'No daily cap on text lookups from the bot. Photo verify (label scan) is included — send a clear image. Upgrade anytime with /upgrade in Telegram.',
    highlight: 'Image scanning',
  },
] as const;

export function LandingPricingSection() {
  return (
    <section
      id="pricing"
      className="mx-auto max-w-[1280px] min-w-0 scroll-mt-20 px-4 py-16 sm:px-6 sm:py-24 lg:px-8"
    >
      <div className="grid gap-10 lg:grid-cols-12 lg:gap-12 lg:items-end">
        <div className="lg:col-span-5">
          <p className="font-mono text-[10px] uppercase tracking-[0.25em] text-(--text-3)">
            Pricing
          </p>
          <h2 className="mt-4 font-display text-[2rem] font-semibold leading-[1.05] tracking-[-0.04em] sm:text-[2.35rem]">
            Pay when you
            <span className="block text-(--text-2)">outgrow free.</span>
          </h2>
          <p
            className="mt-5 max-w-md text-[15px] leading-relaxed"
            style={{ color: 'var(--text-2)' }}
          >
            Web lookups stay free. API and Telegram plans unlock volume,
            automation, and team workflows — upgrade from your dashboard or the
            bot.
          </p>
        </div>
        <div className="hidden lg:col-span-7 lg:block" aria-hidden>
          <div
            className="h-px w-full"
            style={{
              background:
                'linear-gradient(90deg, var(--accent), transparent 85%)',
              opacity: 0.35,
            }}
          />
        </div>
      </div>

      <div className="mt-14">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--text-3)">
          HTTP API
        </h3>
        <div className="mt-5 grid min-w-0 gap-4 lg:grid-cols-2 lg:gap-5">
          {API_TIERS.map((tier) => (
            <div
              key={tier.name}
              className="relative flex min-w-0 flex-col border p-6 sm:p-8"
              style={{
                borderColor: tier.highlighted
                  ? 'var(--accent)'
                  : 'var(--border)',
                background: tier.highlighted
                  ? 'var(--bg-raised)'
                  : 'var(--bg-subtle)',
              }}
            >
              {tier.highlighted ? (
                <div
                  className="absolute right-5 top-5 inline-flex items-center gap-1 border px-2.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wider"
                  style={{
                    borderColor: 'var(--accent)',
                    color: 'var(--accent)',
                    background: 'var(--bg-subtle)',
                  }}
                >
                  <Sparkles className="h-3 w-3" strokeWidth={2} aria-hidden />
                  Popular
                </div>
              ) : null}
              <div className="pr-20">
                <p className="text-[13px] font-semibold text-foreground">
                  {tier.name}
                </p>
                <p className="mt-3 flex flex-wrap items-baseline gap-1.5">
                  <span className="font-display text-[2.15rem] font-semibold tracking-tight text-foreground">
                    {tier.price}
                  </span>
                  <span
                    className="text-[13px]"
                    style={{ color: 'var(--text-3)' }}
                  >
                    {tier.period}
                  </span>
                </p>
                <p
                  className="mt-2 text-[13px] leading-relaxed"
                  style={{ color: 'var(--text-2)' }}
                >
                  {tier.description}
                </p>
              </div>
              <ul className="mt-6 flex-1 space-y-2.5">
                {tier.features.map((f) => (
                  <li
                    key={f}
                    className="flex gap-2.5 text-[13px] leading-snug"
                    style={{ color: 'var(--text-2)' }}
                  >
                    <Check
                      className="mt-0.5 h-4 w-4 shrink-0"
                      style={{ color: 'var(--accent)' }}
                      strokeWidth={2.5}
                      aria-hidden
                    />
                    {f}
                  </li>
                ))}
              </ul>
              <Link
                href={tier.ctaHref}
                className={
                  tier.highlighted
                    ? 'btn-primary mt-8 inline-flex h-12 w-full items-center justify-center text-[14px] focus-visible-ring'
                    : 'btn-secondary mt-8 inline-flex h-12 w-full items-center justify-center text-[14px] focus-visible-ring'
                }
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 border-t border-(--border-subtle) pt-16">
        <h3 className="font-mono text-[10px] uppercase tracking-[0.22em] text-(--text-3)">
          Telegram bot
        </h3>
        <div className="mt-5 grid min-w-0 gap-4 sm:grid-cols-2">
          {BOT_TIERS.map((b) => (
            <div
              key={b.name}
              className="relative border p-6 sm:p-7"
              style={{
                borderColor:
                  'highlight' in b && b.highlight
                    ? 'var(--accent)'
                    : 'var(--border)',
                background: 'var(--bg-raised)',
              }}
            >
              {'highlight' in b && b.highlight ? (
                <div
                  className="absolute right-4 top-4 inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
                  style={{
                    borderColor: 'var(--accent)',
                    color: 'var(--accent)',
                    background: 'var(--bg)',
                  }}
                >
                  <span>📷</span> {b.highlight}
                </div>
              ) : null}
              <p className="text-[13px] font-semibold text-foreground">
                {b.name}
              </p>
              <p className="mt-2 flex flex-wrap items-baseline gap-1.5">
                <span className="font-display text-[1.6rem] font-semibold text-foreground">
                  {b.price}
                </span>
                {'period' in b && b.period ? (
                  <span
                    className="text-[13px]"
                    style={{ color: 'var(--text-3)' }}
                  >
                    {b.period}
                  </span>
                ) : null}
              </p>
              <p
                className="mt-2 text-[13px] leading-relaxed"
                style={{ color: 'var(--text-2)' }}
              >
                {b.body}
              </p>
            </div>
          ))}
        </div>
        <p
          className="mt-6 max-w-xl text-[13px] leading-relaxed"
          style={{ color: 'var(--text-3)' }}
        >
          Open{' '}
          <a
            href="https://t.me/NaijaCheckrBot"
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-(--accent) underline underline-offset-2 transition-colors hover:text-(--accent-hover)"
          >
            @NaijaCheckrBot
          </a>{' '}
          — <span className="font-mono text-[12px]">/upgrade</span> for Bot Pro.
        </p>
      </div>
    </section>
  );
}
