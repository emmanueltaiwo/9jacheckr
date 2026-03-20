import Link from 'next/link';
import { ArrowUpRight, Check, Radio } from 'lucide-react';
import { LandingCodeTabs } from '@/components/landing-code-tabs';
import { SiteNav } from '@/components/site-nav';
import { getServerSession } from '@/lib/auth';

const MARQUEE_CODES = [
  '01-5713',
  '04-8122',
  'A4-8921',
  'B2-4401',
  '08-2233',
  'C1-0098',
  '03-7712',
  'D5-6610',
  '06-3344',
  'E9-1200',
];

function MarqueeRow() {
  const strip = (suffix: string) => (
    <span
      className="flex shrink-0 items-center gap-10 px-6"
      aria-hidden={suffix === 'b'}
    >
      {MARQUEE_CODES.map((code) => (
        <span key={`${code}-${suffix}`} className="text-stone-600">
          {code}
        </span>
      ))}
    </span>
  );
  return (
    <div className="overflow-hidden">
      <div className="marquee-track flex w-max">
        {strip('a')}
        {strip('b')}
      </div>
    </div>
  );
}

export default async function Home() {
  const session = await getServerSession();
  const isSignedIn = Boolean(session?.user);

  const apiBase = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(
    /\/$/,
    '',
  );
  const sampleRequest = apiBase
    ? `curl -sS "${apiBase}/api/verify/01-5713" \\\n  -H "x-api-key: njc_your_api_key_here"`
    : `curl -sS "\${API_BASE}/api/verify/01-5713" \\\n  -H "x-api-key: njc_your_api_key_here"`;

  const sampleResponse = `{
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

  const primaryHref = isSignedIn ? '/dashboard' : '/login';
  const primaryLabel = isSignedIn ? 'Dashboard' : 'Get API key';

  return (
    <div className="bg-app relative min-h-dvh text-[#eceae1]">
      <div className="landing-grain" aria-hidden />
      <div
        className="bg-grid pointer-events-none absolute inset-0"
        aria-hidden
      />
      <div className="landing-diagonals" aria-hidden />

      <SiteNav className="relative z-20" isSignedIn={isSignedIn} />

      <main className="relative z-10">
        <section className="mx-auto max-w-6xl px-4 pb-14 pt-10 sm:px-6 sm:pb-20 sm:pt-14 lg:pt-16">
          <div className="grid items-start gap-12 lg:grid-cols-12 lg:gap-10">
            <div className="lg:col-span-7">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-stone-500">
                <span className="inline-flex items-center gap-1.5 text-stone-400">
                  <Radio className="h-3 w-3 text-[#dfff1f]" strokeWidth={2} />
                  NAFDAC lookup API
                </span>
              </p>

              <h1 className="mt-6 font-display text-[2.5rem] font-semibold leading-[1.05] sm:text-6xl lg:text-[3.25rem] lg:leading-[1.02]">
                Check a NAFDAC number.
                <span className="mt-2 block font-medium text-stone-500">
                  Get JSON back.
                </span>
              </h1>

              <p className="mt-6 max-w-md text-base leading-relaxed text-stone-500 sm:text-[17px]">
                Send the registration number from the product label. We return
                name, category, maker, and dates—so your app can confirm the
                product is registered.
              </p>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                <Link
                  href={primaryHref}
                  className="group inline-flex w-fit items-center gap-2 rounded-xl bg-[#dfff1f] px-6 py-3.5 text-sm font-semibold text-black shadow-[0_0_24px_-8px_rgba(223,255,31,0.5)] transition hover:bg-[#f0ff6a]"
                >
                  {primaryLabel}
                  <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
                <a
                  href="#api"
                  className="inline-flex w-fit items-center gap-2 rounded-xl border border-white/15 px-6 py-3.5 text-sm font-medium text-stone-400 transition hover:border-white/25 hover:text-[#eceae1]"
                >
                  See request example
                </a>
              </div>

              <p className="mt-5 max-w-md text-sm leading-relaxed text-stone-500">
                <a
                  href="https://t.me/NaijaCheckrBot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-[#dfff1f] underline decoration-[#dfff1f]/35 underline-offset-2 transition hover:decoration-[#dfff1f]"
                >
                  Use the Telegram bot for free
                </a>
                .
              </p>
            </div>

            <div className="relative lg:col-span-5">
              <div
                className="absolute -right-4 -top-8 hidden h-32 w-32 border border-[#dfff1f]/20 sm:block lg:-right-8"
                aria-hidden
              />
              <div className="relative border border-white/10 bg-[#080807] p-px shadow-[0_32px_120px_-40px_rgba(0,0,0,0.9)]">
                <div className="flex items-center justify-between border-b border-white/10 bg-[#0c0b09] px-4 py-3">
                  <span className="font-mono text-[10px] text-stone-600">
                    GET /api/verify/01-5713
                  </span>
                  <span className="font-mono text-[10px] text-[#dfff1f]">
                    200
                  </span>
                </div>
                <div className="space-y-4 p-5 sm:p-6">
                  <div>
                    <p className="font-mono text-[10px] text-stone-600">
                      Number
                    </p>
                    <p className="mt-1 font-mono text-lg text-[#eceae1]">
                      01-5713
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-[10px] text-stone-600">Name</p>
                    <p className="mt-1 text-sm text-stone-400">
                      TITUS SARDINE IN VEGETABLE OIL
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {['Food', 'Imported', 'Expires 2030'].map((tag) => (
                      <span
                        key={tag}
                        className="border border-white/10 bg-white/2 px-2 py-1 font-mono text-[10px] text-stone-500"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 border-t border-white/5 pt-4 font-mono text-[11px] text-stone-600">
                    <span className="flex h-5 w-5 items-center justify-center bg-[#dfff1f] text-black">
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                    On the register (sample)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="border-y border-white/5 bg-[#030302]/80 py-3">
          <div className="font-mono text-xs tracking-wide">
            <MarqueeRow />
          </div>
        </div>

        <section
          id="product"
          className="mx-auto max-w-6xl scroll-mt-20 px-4 py-16 sm:px-6 sm:py-20"
        >
          <h2 className="font-display text-2xl font-semibold text-[#eceae1] sm:text-3xl">
            Who it&apos;s for
          </h2>
          <ul className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              "Shops and apps that need to trust a product's NAFDAC number at checkout.",
              'Teams that do not want to look up numbers by hand on the public site.',
              'Anyone integrating one HTTP call instead of scraping.',
            ].map((line) => (
              <li
                key={line}
                className="border-l-2 border-[#dfff1f]/40 pl-4 text-sm leading-relaxed text-stone-500"
              >
                {line}
              </li>
            ))}
          </ul>
        </section>

        <section
          id="api"
          className="scroll-mt-20 border-t border-white/5 bg-[#030302]/50"
        >
          <div className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
            <h2 className="font-display text-2xl font-semibold text-[#eceae1] sm:text-3xl">
              How to call it
            </h2>
            <p className="mt-3 max-w-xl text-sm text-stone-500">
              Add your API key as header{' '}
              <code className="font-mono text-stone-400">x-api-key</code>.
              Replace <code className="font-mono text-stone-400">:nafdac</code>{' '}
              with the number on the pack.
            </p>
            <p className="mt-2 font-mono text-xs text-stone-600">
              {apiBase
                ? `${apiBase}/api/verify/:nafdac`
                : '$API_BASE/api/verify/:nafdac'}
            </p>

            <div className="mt-10 max-w-4xl">
              <LandingCodeTabs
                tabs={[
                  { id: 'curl', label: 'cURL', body: sampleRequest },
                  { id: 'json', label: 'JSON', body: sampleResponse },
                ]}
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-20">
          <Link
            href={primaryHref}
            className="inline-flex items-center gap-2 text-sm font-medium text-[#dfff1f] hover:text-[#f0ff6a]"
          >
            {isSignedIn ? 'Open dashboard' : 'Sign in for a free key'}
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </section>

        <footer className="border-t border-white/5 px-4 py-8 sm:px-6">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-stone-600">
              © {new Date().getFullYear()} 9ja Checkr · NAFDAC number lookup API
            </p>
            <a
              href="#api"
              className="text-xs text-stone-600 hover:text-stone-400"
            >
              API
            </a>
          </div>
        </footer>
      </main>
    </div>
  );
}
