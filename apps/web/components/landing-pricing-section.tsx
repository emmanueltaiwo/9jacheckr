import Link from 'next/link';
import { Check, Sparkles } from 'lucide-react';

const API_TIERS = [
  {
    name: 'Free',
    price: '₦0',
    period: 'forever',
    description: 'Build and test integrations.',
    features: [
      '500 verify checks / month',
      '1 API key',
      'Lower rate limits',
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
      '30,000 checks / month',
      'Multiple API keys',
      'Higher rate limits & priority handling',
      'Full usage metrics in dashboard',
      'Batch verify & product name search',
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
    body: 'Unlimited checks from the bot. Upgrade anytime with /upgrade inside Telegram.',
  },
] as const;

export function LandingPricingSection() {
  return (
    <section
      id="pricing"
      className="mx-auto max-w-[1120px] min-w-0 scroll-mt-20 px-5 py-20 sm:px-6 sm:py-28"
    >
      <div className="mx-auto max-w-2xl text-center">
        <p
          className="font-mono text-[11px] uppercase tracking-[0.2em]"
          style={{ color: 'var(--text-3)' }}
        >
          Pricing
        </p>
        <h2 className="mt-3 font-display text-[1.85rem] font-semibold sm:text-[2.1rem]">
          Simple plans. Upgrade when you&apos;re ready.
        </h2>
        <p
          className="mt-3 text-[15px] leading-relaxed"
          style={{ color: 'var(--text-2)' }}
        >
          Start on Free with no card required. Move to Pro from your dashboard
          or the bot whenever you need more — you&apos;re never locked in.
        </p>
      </div>

      <div className="mt-14">
        <h3
          className="text-center font-mono text-[11px] uppercase tracking-[0.18em]"
          style={{ color: 'var(--text-3)' }}
        >
          HTTP API
        </h3>
        <div className="mt-6 grid min-w-0 gap-5 lg:grid-cols-2">
          {API_TIERS.map((tier) => (
            <div
              key={tier.name}
              className="relative flex min-w-0 flex-col rounded-2xl border p-6 sm:p-8"
              style={{
                borderColor: tier.highlighted
                  ? 'var(--accent)'
                  : 'var(--border)',
                background: tier.highlighted
                  ? 'var(--bg-subtle)'
                  : 'var(--bg-raised)',
              }}
            >
              {tier.highlighted ? (
                <div
                  className="absolute right-5 top-5 inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[11px] font-semibold"
                  style={{
                    borderColor: 'var(--accent)',
                    color: 'var(--accent)',
                    background: 'var(--bg-raised)',
                  }}
                >
                  <Sparkles className="h-3 w-3" strokeWidth={2} aria-hidden />
                  Popular
                </div>
              ) : null}
              <div className="pr-24">
                <p className="text-[13px] font-semibold text-foreground">
                  {tier.name}
                </p>
                <p className="mt-3 flex flex-wrap items-baseline gap-1">
                  <span className="font-display text-[2rem] font-semibold tracking-tight text-foreground">
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
                    ? 'btn-primary mt-8 inline-flex h-11 w-full items-center justify-center text-[14px] focus-visible-ring'
                    : 'btn-secondary mt-8 inline-flex h-11 w-full items-center justify-center text-[14px] focus-visible-ring'
                }
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16">
        <h3
          className="text-center font-mono text-[11px] uppercase tracking-[0.18em]"
          style={{ color: 'var(--text-3)' }}
        >
          Telegram bot
        </h3>
        <div className="mt-6 grid min-w-0 gap-4 sm:grid-cols-2">
          {BOT_TIERS.map((b) => (
            <div
              key={b.name}
              className="rounded-2xl border p-6"
              style={{
                borderColor: 'var(--border-subtle)',
                background: 'var(--bg-subtle)',
              }}
            >
              <p className="text-[13px] font-semibold text-foreground">
                {b.name}
              </p>
              <p className="mt-2 flex flex-wrap items-baseline gap-1">
                <span className="font-display text-[1.5rem] font-semibold text-foreground">
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
          className="mx-auto mt-6 max-w-lg text-center text-[13px] leading-relaxed"
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
          and use <span className="font-mono text-[12px]">/upgrade</span> when
          you want Bot Pro.
        </p>
      </div>
    </section>
  );
}
