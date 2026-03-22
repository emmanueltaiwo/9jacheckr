import Link from 'next/link';
import {
  Check,
  CheckCircle2,
  Code2,
  Globe,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import { SiteNav } from '@/components/site-nav';
import { LandingHeroActions } from '@/components/landing-hero-actions';
import { LandingFooterCta } from '@/components/landing-footer-cta';
import { LandingCodeTabs } from '@/components/landing-code-tabs';

const SUPPORT_PAYSTACK_URL = 'https://paystack.shop/pay/support9jacheckr';

const CODES = [
  'A4-8921',
  '01-5713',
  'B2-4401',
  '04-8122',
  'C1-0098',
  '08-2233',
  'D5-6610',
  '03-7712',
  'E9-1200',
  '06-3344',
  'F3-5517',
  '09-1120',
];

function Marquee() {
  const strip = (key: string) => (
    <span
      className="flex shrink-0 items-center gap-10 px-6"
      aria-hidden={key === 'b'}
    >
      {CODES.map((c) => (
        <span
          key={`${c}-${key}`}
          className="font-mono text-[12px]"
          style={{ color: 'var(--text-3)' }}
        >
          {c}
        </span>
      ))}
    </span>
  );
  return (
    <div
      className="w-full min-w-0 max-w-full overflow-hidden border-y py-3.5"
      style={{
        borderColor: 'var(--border-subtle)',
        background: 'var(--bg-subtle)',
      }}
    >
      <div className="marquee-track">
        {strip('a')}
        {strip('b')}
      </div>
    </div>
  );
}

function TerminalPreview() {
  return (
    <div className="terminal min-w-0 max-w-full shadow-2xl shadow-black/60">
      <div className="terminal-header min-w-0">
        <span
          className="terminal-dot shrink-0"
          style={{ background: '#ff5f57' }}
        />
        <span
          className="terminal-dot shrink-0"
          style={{ background: '#febc2e' }}
        />
        <span
          className="terminal-dot shrink-0"
          style={{ background: '#28c840' }}
        />
        <span
          className="ml-3 min-w-0 flex-1 truncate font-mono text-[11px]"
          style={{ color: 'var(--syn-comment)' }}
        >
          bash - 9ja-checkr
        </span>
      </div>

      <div className="min-w-0 overflow-x-auto p-5 font-mono text-[13px] leading-relaxed">
        <div className="flex min-w-0 gap-2.5">
          <span className="shrink-0" style={{ color: 'var(--terminal-prompt)' }}>
            ›
          </span>
          <div className="min-w-0 wrap-break-word">
            <span style={{ color: 'var(--syn-punct)' }}>curl </span>
            <span style={{ color: 'var(--syn-str)' }}>
              &quot;api.9jacheckr.xyz/api/verify/01-5713&quot;
            </span>
            <span style={{ color: 'var(--syn-punct)' }}> \</span>
            <br />
            <span style={{ color: 'var(--syn-punct)' }}>{'  '}-H </span>
            <span style={{ color: 'var(--syn-str)' }}>
              &quot;x-api-key: njc_sk_••••••••••••&quot;
            </span>
          </div>
        </div>

        <div
          className="my-4 flex items-center gap-2.5 border-t border-b py-3"
          style={{ borderColor: 'var(--terminal-status-border)' }}
        >
          <CheckCircle2
            className="h-4 w-4"
            style={{ color: 'var(--status-ok)' }}
            strokeWidth={2}
          />
          <span
            className="text-[12px] font-semibold"
            style={{ color: 'var(--status-ok)' }}
          >
            200 OK
          </span>
          <span className="text-[12px]" style={{ color: 'var(--syn-comment)' }}>
            ·
          </span>
          <span className="text-[12px]" style={{ color: 'var(--syn-comment)' }}>
            142ms
          </span>
        </div>

        <div
          className="min-w-0 space-y-0.5 overflow-x-auto rounded-lg p-4"
          style={{
            background: 'var(--terminal-json-bg)',
            border: '1px solid var(--terminal-json-border)',
          }}
        >
          <Line p="">
            <Punc>{'{'}</Punc>
          </Line>
          <Line p="  ">
            <Key>&quot;ok&quot;</Key>
            <Punc>: </Punc>
            <Bool>true</Bool>
            <Punc>,</Punc>
          </Line>
          <Line p="  ">
            <Key>&quot;product&quot;</Key>
            <Punc>: {'{'}</Punc>
          </Line>
          <Line p="    ">
            <Key>&quot;nafdac&quot;</Key>
            <Punc>: </Punc>
            <Str>&quot;01-5713&quot;</Str>
            <Punc>,</Punc>
          </Line>
          <Line p="    ">
            <Key>&quot;name&quot;</Key>
            <Punc>: </Punc>
            <Str>&quot;TITUS SARDINE IN VEGETABLE OIL&quot;</Str>
            <Punc>,</Punc>
          </Line>
          <Line p="    ">
            <Key>&quot;category&quot;</Key>
            <Punc>: </Punc>
            <Str>&quot;Food&quot;</Str>
            <Punc>,</Punc>
          </Line>
          <Line p="    ">
            <Key>&quot;source&quot;</Key>
            <Punc>: </Punc>
            <Str>&quot;Imported Product&quot;</Str>
            <Punc>,</Punc>
          </Line>
          <Line p="    ">
            <Key>&quot;manufacturer&quot;</Key>
            <Punc>: </Punc>
            <Str>&quot;UNIMER S.A&quot;</Str>
            <Punc>,</Punc>
          </Line>
          <Line p="    ">
            <Key>&quot;approvedDate&quot;</Key>
            <Punc>: </Punc>
            <Str>&quot;2025-07-30T00:00:00.000Z&quot;</Str>
            <Punc>,</Punc>
          </Line>
          <Line p="    ">
            <Key>&quot;expiryDate&quot;</Key>
            <Punc>: </Punc>
            <Str>&quot;2030-07-29T00:00:00.000Z&quot;</Str>
            <Punc>,</Punc>
          </Line>
          <Line p="    ">
            <Key>&quot;ingredients&quot;</Key>
            <Punc>: [</Punc>
          </Line>
          <Line p="      ">
            <Str>&quot;SARDINE&quot;</Str>
            <Punc>,</Punc>
          </Line>
          <Line p="      ">
            <Str>&quot;VEGETABLE OIL&quot;</Str>
            <Punc>,</Punc>
          </Line>
          <Line p="      ">
            <Str>&quot;SALT&quot;</Str>
          </Line>
          <Line p="    ">
            <Punc>]</Punc>
          </Line>
          <Line p="  ">
            <Punc>{'}'}</Punc>
          </Line>
          <Line p="">
            <Punc>{'}'}</Punc>
          </Line>
        </div>
      </div>
    </div>
  );
}

function Line({ p, children }: { p: string; children: React.ReactNode }) {
  return (
    <div className="flex min-w-0">
      <span
        className="select-none shrink-0 whitespace-pre"
        style={{ color: 'var(--syn-comment)' }}
      >
        {p}
      </span>
      <span className="min-w-0 wrap-break-word">{children}</span>
    </div>
  );
}
function Key({ children }: { children: React.ReactNode }) {
  return <span style={{ color: 'var(--syn-key)' }}>{children}</span>;
}
function Str({ children }: { children: React.ReactNode }) {
  return <span style={{ color: 'var(--syn-str)' }}>{children}</span>;
}
function Bool({ children }: { children: React.ReactNode }) {
  return <span style={{ color: 'var(--syn-bool)' }}>{children}</span>;
}
function Punc({ children }: { children: React.ReactNode }) {
  return <span style={{ color: 'var(--syn-punct)' }}>{children}</span>;
}

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Authoritative data',
    body: 'Results sourced directly from the NAFDAC public register. You get the real record, not a cached approximation.',
  },
  {
    icon: Zap,
    title: 'One endpoint',
    body: 'GET /api/verify/:nafdac. Pass the number from the label, receive structured JSON. Nothing else to learn.',
  },
  {
    icon: Code2,
    title: 'No scraping maintenance',
    body: "We handle the brittle HTML layer so you don't. Your integration stays stable when the source site changes.",
  },
  {
    icon: Globe,
    title: 'Works everywhere',
    body: 'Any language, any runtime. If you can make an HTTP request you can verify a product registration.',
  },
] as const;

const STEPS = [
  {
    n: '01',
    title: 'Sign in with Google',
    body: 'No forms to fill. One click and your account is ready.',
  },
  {
    n: '02',
    title: 'Generate an API key',
    body: 'Head to the dashboard, create a key, copy it. Takes ten seconds.',
  },
  {
    n: '03',
    title: 'Start verifying',
    body: 'Pass the NAFDAC number in the path and your key as a header. Parse the JSON in your app.',
  },
] as const;

export default async function Home() {
  const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(
    /\/$/,
    '',
  );

  const curlSample = apiBase
    ? `curl -sS "${apiBase}/api/verify/01-5713" \\\n  -H "x-api-key: njc_your_key_here"`
    : `curl -sS "https://api.9jacheckr.xyz/api/verify/01-5713" \\\n  -H "x-api-key: njc_your_key_here"`;

  const jsonSample = `{
  "ok": true,
  "product": {
    "nafdac": "01-5713",
    "name": "TITUS SARDINE IN VEGETABLE OIL",
    "category": "Food",
    "source": "Imported Product",
    "manufacturer": "UNIMER S.A",
    "approvedDate": "2025-07-30T00:00:00.000Z",
    "expiryDate": "2030-07-29T00:00:00.000Z",
    "ingredients": ["SARDINE", "VEGETABLE OIL", "SALT"]
  }
}`;

  return (
    <div className="page-bg min-h-dvh w-full min-w-0 overflow-x-hidden text-foreground">
      <SiteNav />

      <section className="relative mx-auto max-w-[1120px] min-w-0 overflow-x-clip px-5 pb-20 pt-16 sm:px-6 sm:pt-24 lg:pb-28 lg:pt-28">
        <div
          className="dot-grid dot-grid-fade pointer-events-none absolute inset-0"
          aria-hidden
        />

        <div
          className="glow-lime pointer-events-none absolute -top-16 left-1/2 h-80 w-80 max-w-[min(100%,20rem)] -translate-x-1/2"
          aria-hidden
        />

        <div className="relative grid min-w-0 items-center gap-12 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:gap-16">
          <div className="min-w-0">
            <div className="anim">
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
                NAFDAC Verification API
              </span>
            </div>

            <h1 className="anim anim-d1 mt-6 font-display text-[2.6rem] font-semibold leading-[1.06] sm:text-[3.2rem] lg:text-[3.5rem]">
              Verify Nigerian
              <br />
              product registrations.
              <br />
              <span style={{ color: 'var(--text-2)' }}>Get JSON back.</span>
            </h1>

            <p
              className="anim anim-d2 mt-6 max-w-[440px] text-[16px] leading-[1.75]"
              style={{ color: 'var(--text-2)' }}
            >
              Send a NAFDAC number. Get back the product name, manufacturer,
              category, and registration dates, structured and ready to use.
            </p>

            <div className="anim anim-d3 mt-8">
              <LandingHeroActions supportHref={SUPPORT_PAYSTACK_URL} />
            </div>

            <p
              className="anim anim-d4 mt-5 text-[13px]"
              style={{ color: 'var(--text-3)' }}
            >
              Prefer no code?{' '}
              <Link
                href="/verify"
                className="underline underline-offset-3 transition-colors hover:text-(--text-2)"
              >
                Look up on the web
              </Link>
              {' · '}
              <a
                href="https://t.me/NaijaCheckrBot"
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-3 transition-colors hover:text-(--text-2)"
              >
                Telegram →
              </a>
            </p>
          </div>

          <div className="anim anim-d2 relative min-w-0 overflow-x-clip">
            <div
              className="pointer-events-none absolute -inset-8 rounded-2xl opacity-60 blur-2xl sm:-inset-8"
              style={{
                background: `radial-gradient(ellipse at center, var(--hero-orb-1), transparent 70%)`,
              }}
              aria-hidden
            />
            <div className="relative min-w-0">
              <TerminalPreview />
            </div>
          </div>
        </div>
      </section>

      <Marquee />

      <section
        id="features"
        className="mx-auto max-w-[1120px] min-w-0 scroll-mt-20 px-5 py-20 sm:px-6 sm:py-28"
      >
        <div className="max-w-lg">
          <p
            className="font-mono text-[11px] uppercase tracking-[0.2em]"
            style={{ color: 'var(--text-3)' }}
          >
            Why use it
          </p>
          <h2 className="mt-3 font-display text-[1.85rem] font-semibold sm:text-[2.1rem]">
            Built for developers, not browsers
          </h2>
          <p
            className="mt-3 text-[15px] leading-relaxed"
            style={{ color: 'var(--text-2)' }}
          >
            Stop typing NAFDAC numbers into a government website by hand.
            Integrate once, query forever.
          </p>
        </div>

        <div className="mt-12 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {FEATURES.map(({ icon: Icon, title, body }) => (
            <div
              key={title}
              className="card card-hover-border group min-w-0 rounded-xl p-5 transition-colors"
            >
              <div
                className="flex h-9 w-9 items-center justify-center rounded-lg border"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--bg-raised)',
                  color: 'var(--text-2)',
                }}
              >
                <Icon className="h-4 w-4" strokeWidth={1.75} />
              </div>
              <h3 className="mt-4 text-[14px] font-semibold">{title}</h3>
              <p
                className="mt-2 text-[13px] leading-relaxed"
                style={{ color: 'var(--text-3)' }}
              >
                {body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section
        className="border-y"
        style={{
          borderColor: 'var(--border-subtle)',
          background: 'var(--bg-subtle)',
        }}
      >
        <div className="mx-auto max-w-[1120px] min-w-0 px-5 py-20 sm:px-6 sm:py-24">
          <div className="max-w-lg min-w-0">
            <p
              className="font-mono text-[11px] uppercase tracking-[0.2em]"
              style={{ color: 'var(--text-3)' }}
            >
              Quick start
            </p>
            <h2 className="mt-3 font-display text-[1.85rem] font-semibold sm:text-[2.1rem]">
              Up and running in minutes
            </h2>
          </div>

          <div className="mt-12 grid gap-6 sm:grid-cols-3">
            {STEPS.map(({ n, title, body }) => (
              <div key={n} className="relative pl-14">
                <span
                  className="absolute left-0 top-0 font-mono text-[2rem] font-bold leading-none"
                  style={{ color: 'var(--border)' }}
                >
                  {n}
                </span>
                <h3 className="text-[15px] font-semibold">{title}</h3>
                <p
                  className="mt-2 text-[13px] leading-relaxed"
                  style={{ color: 'var(--text-3)' }}
                >
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="api"
        className="mx-auto max-w-[1120px] min-w-0 scroll-mt-20 px-5 py-20 sm:px-6 sm:py-28"
      >
        <div className="grid min-w-0 gap-12 lg:grid-cols-[minmax(0,auto)_minmax(0,1fr)] lg:gap-20">
          <div className="max-w-xs min-w-0">
            <p
              className="font-mono text-[11px] uppercase tracking-[0.2em]"
              style={{ color: 'var(--text-3)' }}
            >
              API Reference
            </p>
            <h2 className="mt-3 font-display text-[1.85rem] font-semibold sm:text-[2.1rem]">
              One endpoint. Simple contract.
            </h2>
            <p
              className="mt-3 text-[14px] leading-relaxed"
              style={{ color: 'var(--text-2)' }}
            >
              All requests go to the same path. The NAFDAC number lives in the
              URL. Authentication is a single header.
            </p>

            <div
              className="mt-8 space-y-2 rounded-xl border p-4 text-[13px]"
              style={{
                borderColor: 'var(--border-subtle)',
                background: 'var(--bg-subtle)',
              }}
            >
              {[
                ['Method', 'GET'],
                ['Auth', 'x-api-key header'],
                ['Format', 'JSON'],
                ['Errors', '4xx / 5xx with message'],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between">
                  <span style={{ color: 'var(--text-3)' }}>{k}</span>
                  <span
                    className="font-mono text-[12px]"
                    style={{ color: 'var(--text-2)' }}
                  >
                    {v}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-6">
              <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>
                Endpoint
              </p>
              <div
                className="mt-1.5 flex items-center gap-2 rounded-lg border px-3 py-2"
                style={{
                  borderColor: 'var(--border-subtle)',
                  background: 'var(--bg-raised)',
                }}
              >
                <span
                  className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold"
                  style={{
                    background: 'var(--get-badge-bg)',
                    color: 'var(--get-badge-fg)',
                  }}
                >
                  GET
                </span>
                <code
                  className="font-mono text-[12px] break-all"
                  style={{ color: 'var(--text-2)' }}
                >
                  /api/verify/:nafdac
                </code>
              </div>
            </div>
          </div>

          <div className="min-w-0 lg:max-w-2xl">
            <LandingCodeTabs
              tabs={[
                { id: 'curl', label: 'Request', body: curlSample },
                { id: 'json', label: 'Response', body: jsonSample },
              ]}
            />
          </div>
        </div>
      </section>

      <section
        className="border-t"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="mx-auto max-w-[1120px] min-w-0 px-5 py-20 sm:px-6 sm:py-24">
          <div
            className="relative min-w-0 overflow-hidden rounded-2xl border px-6 py-10 sm:px-12 sm:py-16 sm:flex sm:items-center sm:justify-between"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--bg-subtle)',
            }}
          >
            <div
              className="pointer-events-none absolute right-0 top-1/2 h-72 w-72 -translate-y-1/2 translate-x-1/2"
              style={{
                background: `radial-gradient(circle, var(--hero-orb-2), transparent 70%)`,
              }}
              aria-hidden
            />

            <div className="relative max-w-xl">
              <h2 className="font-display text-[1.6rem] font-semibold sm:text-[1.85rem]">
                Ready to integrate?
              </h2>
              <p
                className="mt-2 text-[15px] leading-relaxed"
                style={{ color: 'var(--text-2)' }}
              >
                Sign in with Google, create a key, and start verifying in under
                two minutes.
              </p>
              <ul className="mt-5 space-y-2">
                {[
                  'Free to start',
                  'Instant API key',
                  'No credit card required',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-[13px]"
                    style={{ color: 'var(--text-2)' }}
                  >
                    <Check
                      className="h-3.5 w-3.5 shrink-0"
                      style={{ color: 'var(--accent)' }}
                      strokeWidth={2.5}
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="relative mt-8 sm:mt-0 sm:shrink-0">
              <LandingFooterCta />
            </div>
          </div>
        </div>
      </section>

      <footer
        className="border-t"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div className="mx-auto flex max-w-[1120px] min-w-0 flex-col gap-8 px-5 py-10 sm:flex-row sm:items-start sm:justify-between sm:px-6">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-[14px] font-semibold text-foreground"
            >
              <span
                className="flex h-[22px] w-[22px] items-center justify-center rounded-[4px] text-[11px] font-bold text-black"
                style={{ background: 'var(--accent)' }}
              >
                9
              </span>
              9ja Checkr
            </Link>
            <p
              className="mt-2 max-w-[240px] text-[12px] leading-relaxed"
              style={{ color: 'var(--text-3)' }}
            >
              NAFDAC registration lookup API for developers and teams. Not
              affiliated with NAFDAC.
            </p>
            <p className="mt-4 text-[12px]" style={{ color: 'var(--text-3)' }}>
              © {new Date().getFullYear()} 9ja Checkr
            </p>
          </div>

          <div className="flex gap-12 text-[13px]">
            <div className="space-y-2.5">
              <p
                className="text-[11px] font-medium uppercase tracking-[0.14em]"
                style={{ color: 'var(--text-3)' }}
              >
                Product
              </p>
              <a
                href="#features"
                className="block transition-colors hover:text-foreground"
                style={{ color: 'var(--text-3)' }}
              >
                Features
              </a>
              <a
                href="#api"
                className="block transition-colors hover:text-foreground"
                style={{ color: 'var(--text-3)' }}
              >
                API
              </a>
              <Link
                href="/login"
                className="block transition-colors hover:text-foreground"
                style={{ color: 'var(--text-3)' }}
              >
                Sign in
              </Link>
            </div>
            <div className="space-y-2.5">
              <p
                className="text-[11px] font-medium uppercase tracking-[0.14em]"
                style={{ color: 'var(--text-3)' }}
              >
                Community
              </p>
              <a
                href="https://t.me/NaijaCheckrBot"
                target="_blank"
                rel="noopener noreferrer"
                className="block transition-colors hover:text-foreground"
                style={{ color: 'var(--text-3)' }}
              >
                Telegram bot
              </a>
              <a
                href={SUPPORT_PAYSTACK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="block transition-colors hover:text-foreground"
                style={{ color: 'var(--text-3)' }}
              >
                Support the project
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
