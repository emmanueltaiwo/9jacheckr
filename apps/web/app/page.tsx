import Link from 'next/link';
import {
  ArrowRight,
  Bot,
  Camera,
  Check,
  Code2,
  HeartHandshake,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';
import { LandingHeroVerify } from '@/components/landing-hero-verify';
import { LandingPricingSection } from '@/components/landing-pricing-section';
import { TweetWall } from '@/components/tweet-wall';

// Illustrative registration-style tokens (not claims about real products)
const TICKER_ITEMS = [
  '01-5713',
  'A1-5645',
  '04-81234',
  '01-5713',
  'A1-5645',
  '04-81234',
  '01-5713',
  'A1-5645',
  '04-81234',
  '01-5713',
  'A1-5645',
  '04-81234',
] as const;

const STEPS = [
  {
    num: '01',
    title: 'Find the number',
    body: 'Look near the barcode or product name on the label — often formatted like 01-5713 or with a short letter prefix (e.g. A1-5645).',
  },
  {
    num: '02',
    title: 'Paste it above',
    body: 'Type or paste the number and verify. On the website you do not need an account for a single lookup.',
  },
  {
    num: '03',
    title: 'See the facts',
    body: 'We show product name, manufacturer, and approval-related dates as returned from the public NAFDAC registration channel — see our disclaimer for limits.',
  },
] as const;

const FEATURES = [
  {
    icon: ShieldCheck,
    label: 'Official register channel',
    body: 'Lookups use the same public NAFDAC registration flow people use online — not a separate proprietary database. We cache results server-side so repeat checks stay fast.',
  },
  {
    icon: Zap,
    label: 'Fast as typing',
    body: 'Enter a number on the web and get a result without a full page reload. No sign-up required for the homepage lookup.',
  },
  {
    icon: HeartHandshake,
    label: 'Built for real workflows',
    body: 'Useful for shoppers, pharmacies, importers, and teams who need a quick structured view of registration details.',
  },
  {
    icon: Bot,
    label: 'Telegram bot',
    body: 'Text @NaijaCheckrBot the NAFDAC number for a lookup. Free tier has a small daily limit; Bot Pro removes the daily cap.',
  },
  {
    icon: Camera,
    label: 'Photo verify (Bot Pro)',
    body: 'With Bot Pro, send a clear photo of the label; we read the text and try to extract the registration number. Not available on the public HTTP API.',
  },
  {
    icon: Code2,
    label: 'Developer API',
    body: 'Create an API key in the dashboard — 300 combined verify calls per month on Free, higher limits plus batch verify and product search on API Pro.',
  },
] as const;

const STATS = [
  {
    value: '300',
    label: 'free API calls / mo',
    sub: 'verify lookups on the Free API tier',
  },
  {
    value: 'Free',
    label: 'web lookup',
    sub: 'no account on this page',
  },
  {
    value: 'Cache',
    label: '+ live fetch',
    sub: 'stored after lookup; then NAFDAC portal when needed',
  },
  {
    value: '2',
    label: 'ways to check',
    sub: 'this site & Telegram bot',
  },
] as const;

export default function Home() {
  const tickerDouble = [...TICKER_ITEMS, ...TICKER_ITEMS];

  return (
    <div
      className="min-h-dvh w-full min-w-0 overflow-x-hidden"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      <SiteNav />

      {/* ═══════════════════════════════════════════════════════
          HERO — full-viewport, centered, verify form as the star
          ═══════════════════════════════════════════════════════ */}
      <section className="relative flex min-h-dvh flex-col items-center px-4 pb-8 pt-28 sm:px-6 sm:pb-10 sm:pt-32">
        {/* Radial glow sitting behind the form */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[700px] w-[700px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-[0.055] blur-[100px]"
          style={{ background: 'var(--accent)' }}
          aria-hidden
        />

        {/* Subtle dot grid */}
        <div
          className="pointer-events-none absolute inset-0 dot-grid dot-grid-fade"
          aria-hidden
        />

        <div className="relative flex w-full max-w-2xl flex-1 flex-col justify-center text-center">
          {/* Category pill */}
          <div
            className="mb-6 inline-flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-[12px] font-medium"
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
            Nigeria · NAFDAC registration lookup · Independent tool
          </div>

          {/* Headline */}
          <h1 className="text-[clamp(2.6rem,9vw,4.5rem)] font-bold leading-[1.06] tracking-[-0.04em]">
            <span style={{ color: 'var(--text)' }}>Is this product </span>
            <span
              className="relative inline-block"
              style={{ color: 'var(--accent)' }}
            >
              registered?
              {/* Underline squiggle */}
              <svg
                aria-hidden
                className="absolute -bottom-1 left-0 w-full"
                viewBox="0 0 400 10"
                preserveAspectRatio="none"
                style={{ height: '6px', opacity: 0.5 }}
              >
                <path
                  d="M0,6 Q50,2 100,6 T200,6 T300,6 T400,6"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  fill="none"
                />
              </svg>
            </span>
          </h1>

          <p
            className="mx-auto mt-5 max-w-md text-[16px] leading-relaxed sm:text-[17px]"
            style={{ color: 'var(--text-2)' }}
          >
            Look up a NAFDAC registration number — name, manufacturer, and dates
            as returned from the public register flow. Free on this page, no
            sign-up.
          </p>

          {/* Verify form */}
          <div className="mt-9 sm:mt-10">
            <LandingHeroVerify />
          </div>

          <p className="mt-5 text-[12px]" style={{ color: 'var(--text-3)' }}>
            Data from the official NAFDAC public register ·{' '}
            <Link
              href="/disclaimer"
              className="underline underline-offset-2 transition-colors hover:text-(--text-2)"
            >
              not affiliated with NAFDAC
            </Link>
          </p>
        </div>

        {/* In flow below hero — avoids overlapping copy on short viewports */}
        <div className="mt-8 flex shrink-0 flex-col items-center gap-1.5 pb-2 sm:mt-10 [@media(max-height:520px)]:hidden">
          <span
            className="text-[11px] uppercase tracking-[0.18em]"
            style={{ color: 'var(--text-3)' }}
          >
            Scroll
          </span>
          <div
            className="h-8 w-px"
            style={{
              background:
                'linear-gradient(to bottom, var(--accent), transparent)',
              opacity: 0.5,
            }}
            aria-hidden
          />
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          SCROLLING TICKER
          ═══════════════════════════════════════════════════════ */}
      <div
        className="overflow-hidden border-y py-3.5"
        style={{
          borderColor: 'var(--border-subtle)',
          background: 'var(--bg-subtle)',
        }}
        aria-hidden
      >
        <div className="ticker-track flex w-max items-center gap-8">
          {tickerDouble.map((code, i) => (
            <span
              key={`${code}-${i}`}
              className="shrink-0 font-mono text-[11px] tracking-widest"
              style={{ color: 'var(--text-3)' }}
            >
              {code}
            </span>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════════════
          STATS — large numbers, editorial feel
          ═══════════════════════════════════════════════════════ */}
      <section className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="grid grid-cols-2 gap-y-12 gap-x-8 sm:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.value} className="flex flex-col">
              <span
                className="text-[clamp(2.2rem,5vw,3rem)] font-bold leading-none tracking-tight"
                style={{ color: 'var(--accent)' }}
              >
                {s.value}
              </span>
              <span className="mt-2 text-[14px] font-medium text-foreground">
                {s.label}
              </span>
              <span
                className="mt-0.5 text-[12px]"
                style={{ color: 'var(--text-3)' }}
              >
                {s.sub}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          HOW IT WORKS
          ═══════════════════════════════════════════════════════ */}
      <section
        id="how-it-works"
        className="relative border-t scroll-mt-24"
        style={{
          borderColor: 'var(--border-subtle)',
          background: 'var(--bg-subtle)',
        }}
      >
        {/* Large decorative "?" in background */}
        <div
          className="pointer-events-none absolute right-0 top-0 select-none text-[clamp(12rem,25vw,22rem)] font-bold leading-none opacity-[0.03]"
          style={{ color: 'var(--accent)', lineHeight: 1 }}
          aria-hidden
        >
          ?
        </div>

        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mb-14">
            <p
              className="font-mono text-[11px] uppercase tracking-[0.25em]"
              style={{ color: 'var(--accent)' }}
            >
              How it works
            </p>
            <h2 className="mt-3 text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-[1.1] tracking-[-0.03em] text-foreground">
              Three steps. Under ten seconds.
            </h2>
          </div>

          <div className="grid gap-px" style={{ background: 'var(--border)' }}>
            {STEPS.map((step, i) => (
              <div
                key={step.num}
                className="flex gap-6 p-8 sm:p-10"
                style={{ background: 'var(--bg-subtle)' }}
              >
                {/* Big step number */}
                <div className="hidden shrink-0 items-start sm:flex">
                  <span
                    className="font-mono text-[clamp(2.5rem,5vw,3.5rem)] font-bold leading-none tracking-tighter"
                    style={{
                      color: i === 0 ? 'var(--accent)' : 'var(--text-3)',
                      opacity: i === 0 ? 1 : 0.5,
                    }}
                  >
                    {step.num}
                  </span>
                </div>
                <div className="min-w-0">
                  <span
                    className="font-mono text-[11px] uppercase tracking-widest sm:hidden"
                    style={{ color: 'var(--accent)' }}
                  >
                    {step.num}
                  </span>
                  <h3 className="text-[18px] font-bold text-foreground sm:text-[20px]">
                    {step.title}
                  </h3>
                  <p
                    className="mt-2 max-w-lg text-[14px] leading-relaxed sm:text-[15px]"
                    style={{ color: 'var(--text-2)' }}
                  >
                    {step.body}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-10">
            <Link
              href="/verify"
              className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-[14px] font-medium transition-all hover:border-(--accent) hover:text-(--accent)"
              style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
            >
              Try the lookup
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          FEATURES — 2-column grid with accent stripe left
          ═══════════════════════════════════════════════════════ */}
      <section
        className="border-t"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mb-12">
            <p
              className="font-mono text-[11px] uppercase tracking-[0.25em]"
              style={{ color: 'var(--accent)' }}
            >
              Features
            </p>
            <h2 className="mt-3 text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-[1.1] tracking-[-0.03em] text-foreground">
              Everything you need to verify.
            </h2>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <div
                  key={f.label}
                  className="group relative overflow-hidden rounded-2xl border p-6 transition-all hover:border-(--border)"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    background: 'var(--bg-subtle)',
                  }}
                >
                  {/* Hover accent glow */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{
                      background:
                        'radial-gradient(circle at 30% 20%, rgba(223,255,31,0.05), transparent 60%)',
                    }}
                    aria-hidden
                  />
                  <div
                    className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border"
                    style={{
                      borderColor: 'var(--border)',
                      background: 'var(--bg-raised)',
                    }}
                  >
                    <Icon
                      className="h-5 w-5"
                      strokeWidth={1.75}
                      style={{ color: 'var(--accent)' }}
                      aria-hidden
                    />
                  </div>
                  <h3 className="text-[15px] font-semibold text-foreground">
                    {f.label}
                  </h3>
                  <p
                    className="mt-1.5 text-[13px] leading-relaxed"
                    style={{ color: 'var(--text-2)' }}
                  >
                    {f.body}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          COMMUNITY — tweets from real users
          ═══════════════════════════════════════════════════════ */}
      <section
        className="relative border-t overflow-hidden"
        style={{
          borderColor: 'var(--border-subtle)',
          background: 'var(--bg-subtle)',
        }}
      >
        {/* Large decorative "9" */}
        <div
          className="pointer-events-none absolute -left-8 top-0 select-none text-[clamp(16rem,35vw,28rem)] font-bold leading-none opacity-[0.025]"
          style={{ color: 'var(--text)', lineHeight: 1 }}
          aria-hidden
        >
          9
        </div>

        <div className="relative mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="mb-12 flex items-end justify-between gap-8">
            <div>
              <p
                className="font-mono text-[11px] uppercase tracking-[0.25em]"
                style={{ color: 'var(--accent)' }}
              >
                Community
              </p>
              <h2 className="mt-3 text-[clamp(1.8rem,4vw,2.6rem)] font-bold leading-[1.1] tracking-[-0.03em] text-foreground">
                From the community
              </h2>
              <p
                className="mt-3 max-w-sm text-[14px] leading-relaxed"
                style={{ color: 'var(--text-2)' }}
              >
                Shout-outs and posts we have permission to embed. Mention the
                bot or tag #9jacheckr on X if you would like to be featured.
              </p>
            </div>
            <a
              href="https://x.com/search?q=9jacheckr"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-[13px] transition-colors hover:bg-(--nav-hover-bg) sm:inline-flex"
              style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 shrink-0 fill-current"
                aria-hidden
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.844L1.254 2.25H8.08l4.258 5.631 5.906-5.631Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
              View on X
            </a>
          </div>

          <TweetWall />

          {/* If only one tweet, show a placeholder card inviting more */}
          <div
            className="mt-5 flex items-center gap-4 rounded-2xl border border-dashed p-6"
            style={{ borderColor: 'var(--border)' }}
          >
            <div
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--bg-raised)',
              }}
            >
              <svg
                viewBox="0 0 24 24"
                className="h-5 w-5 fill-current"
                style={{ color: 'var(--text-3)' }}
                aria-hidden
              >
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.736-8.844L1.254 2.25H8.08l4.258 5.631 5.906-5.631Zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
            <div>
              <p className="text-[13px] font-medium text-foreground">
                Share your experience
              </p>
              <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>
                Tag{' '}
                <span
                  className="font-mono transition-colors hover:text-foreground"
                  style={{ color: 'var(--text-2)' }}
                >
                  #9jacheckr and @ez0xai
                </span>{' '}
                on X to get featured here.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════
          PRICING
          ═══════════════════════════════════════════════════════ */}
      <LandingPricingSection />

      {/* ═══════════════════════════════════════════════════════
          DEVELOPERS — split layout with code sample
          ═══════════════════════════════════════════════════════ */}
      <section
        id="developers"
        className="border-t"
        style={{
          borderColor: 'var(--border-subtle)',
          background: 'var(--bg-subtle)',
        }}
      >
        <div className="mx-auto max-w-5xl px-4 py-20 sm:px-6 sm:py-28">
          <div className="grid items-start gap-12 lg:grid-cols-2 lg:gap-16">
            <div>
              <div
                className="mb-4 inline-flex items-center gap-1.5 rounded-md border px-2.5 py-1 text-[12px] font-medium"
                style={{
                  borderColor: 'var(--border)',
                  color: 'var(--text-2)',
                  background: 'var(--bg-raised)',
                }}
              >
                <Code2 className="h-3.5 w-3.5" aria-hidden />
                For developers
              </div>
              <h2 className="text-[clamp(1.75rem,3.5vw,2.25rem)] font-bold leading-[1.1] tracking-[-0.03em] text-foreground">
                One API call.
                <span className="block" style={{ color: 'var(--text-2)' }}>
                  Any product, any scale.
                </span>
              </h2>
              <p
                className="mt-4 text-[15px] leading-relaxed"
                style={{ color: 'var(--text-2)' }}
              >
                Call our API with your dashboard key. Free tier for testing;
                upgrade for production volume, batch verify, and product search.
              </p>
              <ul className="mt-6 space-y-2.5">
                {[
                  'REST-style JSON — no SDK required',
                  'GET /api/verify/:nafdac with x-api-key header',
                  '300 free verify calls / month (dashboard key)',
                  'API Pro: batch verify, product search, higher limits',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2.5 text-[14px]"
                    style={{ color: 'var(--text-2)' }}
                  >
                    <Check
                      className="h-4 w-4 shrink-0"
                      strokeWidth={2.5}
                      style={{ color: 'var(--accent)' }}
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/docs"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-semibold text-black transition-opacity hover:opacity-90"
                  style={{ background: 'var(--accent)' }}
                >
                  Read the docs
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Link>
                <Link
                  href="/login?next=/dashboard"
                  className="inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-[14px] font-medium transition-colors hover:bg-(--nav-hover-bg)"
                  style={{
                    borderColor: 'var(--border)',
                    color: 'var(--text-2)',
                  }}
                >
                  Dashboard & keys
                </Link>
              </div>
            </div>

            {/* Code sample */}
            <div
              className="overflow-hidden rounded-2xl border font-mono"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--bg-raised)',
              }}
            >
              <div
                className="flex items-center justify-between border-b px-4 py-3"
                style={{
                  borderColor: 'var(--border-subtle)',
                  background: 'var(--bg-overlay)',
                }}
              >
                <div className="flex gap-1.5" aria-hidden>
                  <span className="h-2.5 w-2.5 rounded-full bg-red-500/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-400/60" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-400/60" />
                </div>
                <span
                  className="text-[11px]"
                  style={{ color: 'var(--text-3)' }}
                >
                  curl example
                </span>
              </div>
              <pre
                className="overflow-x-auto p-5 text-[13px] leading-[1.8]"
                style={{ color: 'var(--text-2)' }}
              >
                <code
                  dangerouslySetInnerHTML={{
                    __html: `<span style="color:var(--syn-comment)"># Verify by NAFDAC number (path segment)</span>\ncurl -s <span style="color:var(--syn-str)">"https://api.9jacheckr.xyz/api/verify/01-5713"</span> \\\n  -H <span style="color:var(--syn-str)">"x-api-key: YOUR_API_KEY"</span>`,
                  }}
                />
              </pre>
              <div
                className="border-t px-5 py-3.5"
                style={{ borderColor: 'var(--border-subtle)' }}
              >
                <span
                  className="inline-flex items-center gap-1.5 text-[11px] font-medium"
                  style={{ color: 'var(--stat-found)' }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-current" />
                  Returns: JSON — ok + product (name, manufacturer, dates, …)
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
