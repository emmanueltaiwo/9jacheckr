'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { ArrowRight, Check, Copy, ExternalLink, Sparkles } from 'lucide-react';

/* ─────────────────────────────────────────────────────────────────
   Sidebar navigation structure
───────────────────────────────────────────────────────────────── */
const SECTIONS = [
  { id: 'overview', label: 'Overview' },
  { id: 'authentication', label: 'Authentication' },
  { id: 'quickstart', label: 'Quick start' },
  {
    id: 'endpoints',
    label: 'Endpoints',
    children: [
      { id: 'verify-endpoint', label: 'GET /api/verify/:nafdac' },
      { id: 'batch-endpoint', label: 'POST /api/verify/batch' },
      { id: 'search-endpoint', label: 'GET /api/products/search' },
      { id: 'telegram-photo', label: 'Photo verify (Telegram)' },
    ],
  },
  { id: 'sdk', label: 'JavaScript SDK' },
  { id: 'rate-limits', label: 'Rate limits' },
  { id: 'errors', label: 'Error codes' },
  { id: 'examples', label: 'Code examples' },
  { id: 'upgrade', label: 'Upgrade to Pro' },
] as const;

/* ─────────────────────────────────────────────────────────────────
   Small reusable pieces
───────────────────────────────────────────────────────────────── */
function FreeBadge() {
  return (
    <span
      className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
      style={{
        borderColor: 'var(--border)',
        color: 'var(--text-2)',
        background: 'var(--bg-overlay)',
      }}
    >
      Free
    </span>
  );
}

function ProBadge() {
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
      style={{
        borderColor: 'var(--accent)',
        color: 'var(--accent)',
        background: 'var(--bg)',
      }}
    >
      <Sparkles className="h-2.5 w-2.5" aria-hidden />
      Pro
    </span>
  );
}

function SectionHeading({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h2
      id={id}
      className="scroll-mt-8 text-[1.4rem] font-bold tracking-[-0.025em] text-foreground sm:text-[1.6rem]"
    >
      {children}
    </h2>
  );
}

function SubHeading({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  return (
    <h3
      id={id}
      className="scroll-mt-8 text-[1.1rem] font-semibold tracking-tight text-foreground sm:text-[1.2rem]"
    >
      {children}
    </h3>
  );
}

function Divider() {
  return (
    <hr className="my-10" style={{ borderColor: 'var(--border-subtle)' }} />
  );
}

function Paragraph({ children }: { children: React.ReactNode }) {
  return (
    <p
      className="text-[15px] leading-relaxed"
      style={{ color: 'var(--text-2)' }}
    >
      {children}
    </p>
  );
}

function InlineCode({ children }: { children: React.ReactNode }) {
  return (
    <code
      className="rounded px-1.5 py-0.5 font-mono text-[13px]"
      style={{
        background: 'var(--bg-overlay)',
        border: '1px solid var(--border)',
        color: 'var(--text)',
      }}
    >
      {children}
    </code>
  );
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  function copy() {
    void navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }
  return (
    <button
      type="button"
      onClick={copy}
      className="flex h-7 w-7 items-center justify-center rounded-md transition-colors hover:bg-(--nav-hover-bg) focus-visible-ring"
      style={{ color: copied ? 'var(--accent)' : 'var(--text-3)' }}
      aria-label="Copy"
    >
      {copied ? (
        <Check className="h-3.5 w-3.5" strokeWidth={2.5} />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
    </button>
  );
}

function CodeBlock({ code, title }: { code: string; title?: string }) {
  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-raised)' }}
    >
      {title ? (
        <div
          className="flex items-center justify-between border-b px-4 py-2.5"
          style={{
            borderColor: 'var(--border-subtle)',
            background: 'var(--bg-overlay)',
          }}
        >
          <span
            className="font-mono text-[11px]"
            style={{ color: 'var(--text-3)' }}
          >
            {title}
          </span>
          <CopyButton text={code} />
        </div>
      ) : null}
      <pre
        className="overflow-x-auto p-4 font-mono text-[13px] leading-[1.75]"
        style={{ color: 'var(--text-2)' }}
      >
        <code>{code}</code>
      </pre>
    </div>
  );
}

function JsonBlock({ title, json }: { title?: string; json: string }) {
  return (
    <div
      className="overflow-hidden rounded-xl border"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-raised)' }}
    >
      {title ? (
        <div
          className="flex items-center justify-between border-b px-4 py-2.5"
          style={{
            borderColor: 'var(--border-subtle)',
            background: 'var(--bg-overlay)',
          }}
        >
          <span
            className="font-mono text-[11px]"
            style={{ color: 'var(--text-3)' }}
          >
            {title}
          </span>
          <CopyButton text={json} />
        </div>
      ) : null}
      <pre
        className="overflow-x-auto p-4 font-mono text-[13px] leading-[1.75]"
        dangerouslySetInnerHTML={{
          __html: json
            .replace(
              /("[\w-]+")\s*:/g,
              `<span style="color:var(--syn-key)">$1</span>:`,
            )
            .replace(
              /:\s*("(?:[^"\\]|\\.)*")/g,
              `: <span style="color:var(--syn-str)">$1</span>`,
            )
            .replace(
              /:\s*(\d+(?:\.\d+)?)\b/g,
              `: <span style="color:var(--syn-num)">$1</span>`,
            )
            .replace(
              /:\s*(true|false|null)\b/g,
              `: <span style="color:var(--syn-bool)">$1</span>`,
            ),
        }}
      />
    </div>
  );
}

function ParamRow({
  name,
  type,
  required,
  description,
}: {
  name: string;
  type: string;
  required?: boolean;
  description: string;
}) {
  return (
    <tr className="border-b" style={{ borderColor: 'var(--border-subtle)' }}>
      <td className="py-3 pr-4 align-top">
        <code className="font-mono text-[13px] text-foreground">{name}</code>
        {required ? (
          <span
            className="ml-1 text-[10px] font-bold"
            style={{ color: 'var(--accent)' }}
          >
            *
          </span>
        ) : null}
      </td>
      <td className="py-3 pr-4 align-top">
        <code
          className="font-mono text-[11px]"
          style={{ color: 'var(--text-3)' }}
        >
          {type}
        </code>
      </td>
      <td
        className="py-3 align-top text-[13px] leading-relaxed"
        style={{ color: 'var(--text-2)' }}
      >
        {description}
      </td>
    </tr>
  );
}

function Table({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="overflow-x-auto rounded-xl border"
      style={{ borderColor: 'var(--border)' }}
    >
      <table className="w-full border-collapse">
        <tbody>{children}</tbody>
      </table>
    </div>
  );
}

function CalloutInfo({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex gap-3 rounded-xl border px-4 py-3.5 text-[13px] leading-relaxed"
      style={{
        borderColor: 'rgba(223,255,31,0.2)',
        background: 'rgba(223,255,31,0.04)',
        color: 'var(--text-2)',
      }}
    >
      <span className="mt-0.5 shrink-0">💡</span>
      <div>{children}</div>
    </div>
  );
}

function CalloutWarning({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="flex gap-3 rounded-xl border px-4 py-3.5 text-[13px] leading-relaxed"
      style={{
        borderColor: 'var(--callout-warning-border)',
        background: 'var(--callout-warning-bg)',
        color: 'var(--callout-warning-fg)',
      }}
    >
      <span className="mt-0.5 shrink-0">⚠️</span>
      <div>{children}</div>
    </div>
  );
}

function EndpointTag({ method, path }: { method: string; path: string }) {
  const bg =
    method === 'POST' ? 'rgba(99,102,241,0.12)' : 'rgba(34,197,94,0.12)';
  const color = method === 'POST' ? '#818cf8' : '#4ade80';
  return (
    <div
      className="flex flex-wrap items-center gap-2.5 rounded-xl border px-4 py-3 font-mono text-[13px]"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-raised)' }}
    >
      <span
        className="rounded-md px-2 py-0.5 text-[11px] font-bold uppercase tracking-wider"
        style={{ background: bg, color }}
      >
        {method}
      </span>
      <span style={{ color: 'var(--text)' }}>{path}</span>
    </div>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Fixed sidebar — stays locked while content scrolls
───────────────────────────────────────────────────────────────── */
function DocsSidebar({ active }: { active: string }) {
  return (
    /* Fixed from just below the floating nav (4px top + 48px height + 8px gap = 60px) to bottom */
    <aside
      className="fixed bottom-0 left-0 hidden w-56 overflow-y-auto xl:block"
      style={{
        top: '72px',
        borderRight: '1px solid var(--border-subtle)',
        background: 'var(--bg)',
      }}
    >
      <div className="px-4 py-8">
        <p
          className="mb-2 font-mono text-[10px] uppercase tracking-[0.2em]"
          style={{ color: 'var(--text-3)' }}
        >
          On this page
        </p>

        <nav className="space-y-0.5">
          {SECTIONS.map((s) => (
            <div key={s.id}>
              <a
                href={`#${s.id}`}
                className="block rounded-lg px-2.5 py-1.5 text-[13px] font-medium transition-colors"
                style={{
                  color: active === s.id ? 'var(--accent)' : 'var(--text-2)',
                  background:
                    active === s.id ? 'var(--nav-active-bg)' : 'transparent',
                }}
              >
                {s.label}
              </a>
              {'children' in s && s.children
                ? s.children.map((c) => (
                    <a
                      key={c.id}
                      href={`#${c.id}`}
                      className="block rounded-lg py-1.5 pl-5 pr-2.5 text-[12px] transition-colors"
                      style={{
                        color:
                          active === c.id ? 'var(--accent)' : 'var(--text-3)',
                        background:
                          active === c.id
                            ? 'var(--nav-active-bg)'
                            : 'transparent',
                      }}
                    >
                      {c.label}
                    </a>
                  ))
                : null}
            </div>
          ))}
        </nav>

        {/* Bottom links */}
        <div
          className="mt-8 space-y-1 border-t pt-6"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <Link
            href="/dashboard/keys"
            className="block rounded-lg px-2.5 py-1.5 text-[12px] transition-colors hover:text-foreground"
            style={{ color: 'var(--text-3)' }}
          >
            Get API key
          </Link>
          <Link
            href="/disclaimer"
            className="block rounded-lg px-2.5 py-1.5 text-[12px] transition-colors hover:text-foreground"
            style={{ color: 'var(--text-3)' }}
          >
            Disclaimer
          </Link>
          <a
            href="mailto:devemmanuel1@gmail.com?subject=9ja Checkr API"
            className="block rounded-lg px-2.5 py-1.5 text-[12px] transition-colors hover:text-foreground"
            style={{ color: 'var(--text-3)' }}
          >
            Support
          </a>
        </div>
      </div>
    </aside>
  );
}

/* ─────────────────────────────────────────────────────────────────
   Main docs export
───────────────────────────────────────────────────────────────── */
export function DocsContent() {
  const [active, setActive] = useState('overview');
  const allIds = SECTIONS.flatMap((s) =>
    'children' in s ? [s.id, ...s.children.map((c) => c.id)] : [s.id],
  );
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current?.disconnect();
    const entries = new Map<string, IntersectionObserverEntry>();
    observerRef.current = new IntersectionObserver(
      (obs) => {
        obs.forEach((e) => entries.set(e.target.id, e));
        const visible = [...entries.values()]
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length) setActive(visible[0].target.id);
      },
      { rootMargin: '-10% 0px -75% 0px' },
    );
    allIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observerRef.current?.observe(el);
    });
    return () => observerRef.current?.disconnect();
  }, []);

  const BASE_URL = 'https://api.9jacheckr.xyz';

  return (
    <>
      <DocsSidebar active={active} />

      {/* Main content — offset left on xl to clear the fixed sidebar */}
      <main className="min-w-0 px-4 pt-28 pb-28 sm:px-8 xl:ml-56 xl:px-12">
        <div className="mx-auto max-w-3xl">
          {/* Page header */}
          <div className="mb-12">
            <h1 className="text-[clamp(2rem,5vw,3rem)] font-bold leading-[1.08] tracking-[-0.04em] text-foreground">
              9ja Checkr API
            </h1>
            <p
              className="mt-3 max-w-xl text-[16px] leading-relaxed"
              style={{ color: 'var(--text-2)' }}
            >
              JSON HTTP API for NAFDAC registration lookups. Use{' '}
              <InlineCode>GET /api/verify/:nafdac</InlineCode> with an{' '}
              <InlineCode>x-api-key</InlineCode> header. Free and API Pro tiers
              — Pro adds batch verify and product search. Not a government feed
              —{' '}
              <Link
                href="/disclaimer"
                className="font-medium underline underline-offset-2 hover:text-foreground"
                style={{ color: 'var(--accent)' }}
              >
                disclaimer
              </Link>
              .
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/login?next=/dashboard"
                className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-semibold text-black transition-opacity hover:opacity-90"
                style={{ background: 'var(--accent)' }}
              >
                Get an API key
                <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#quickstart"
                className="inline-flex items-center gap-2 rounded-xl border px-5 py-2.5 text-[14px] font-medium transition-colors hover:bg-(--nav-hover-bg)"
                style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
              >
                Quick start
              </a>
            </div>
          </div>

          {/* ── Overview ─────────────────────────────────────── */}
          <section id="overview" className="scroll-mt-8 space-y-5">
            <SectionHeading id="overview">Overview</SectionHeading>
            <Paragraph>
              Lookups use the same public NAFDAC registration channel the site
              automates; responses may be served from our cache after the first
              fetch. All successful responses are JSON with an{' '}
              <InlineCode>ok</InlineCode> field.
            </Paragraph>
            <Paragraph>
              All requests go to: <InlineCode>{BASE_URL}</InlineCode>
            </Paragraph>

            <div className="grid gap-4 sm:grid-cols-2">
              <div
                className="rounded-2xl border p-5"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--bg-subtle)',
                }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-[14px] font-semibold text-foreground">
                    Free tier
                  </h3>
                  <FreeBadge />
                </div>
                <ul className="space-y-2">
                  {[
                    '300 API uses / month (single GET verify only)',
                    '1 API key',
                    'GET /api/verify/:nafdac',
                    'Lower per-window rate limits',
                    'No dashboard metrics',
                  ].map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-[13px]"
                      style={{ color: 'var(--text-2)' }}
                    >
                      <Check
                        className="mt-0.5 h-3.5 w-3.5 shrink-0"
                        strokeWidth={2.5}
                        style={{ color: 'var(--text-3)' }}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
              <div
                className="rounded-2xl border p-5"
                style={{
                  borderColor: 'var(--accent)',
                  background: 'var(--bg-raised)',
                }}
              >
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-[14px] font-semibold text-foreground">
                    Pro tier
                  </h3>
                  <ProBadge />
                </div>
                <ul className="space-y-2">
                  {[
                    '50,000 API uses / month (verify rows + successful search)',
                    'Multiple API keys',
                    'POST /api/verify/batch (up to 40 numbers)',
                    'GET /api/products/search (indexed DB)',
                    'Higher per-window rate limits',
                    'Full dashboard metrics',
                    'Commercial use',
                  ].map((f) => (
                    <li
                      key={f}
                      className="flex items-start gap-2 text-[13px]"
                      style={{ color: 'var(--text-2)' }}
                    >
                      <Check
                        className="mt-0.5 h-3.5 w-3.5 shrink-0"
                        strokeWidth={2.5}
                        style={{ color: 'var(--accent)' }}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          <Divider />

          {/* ── Authentication ───────────────────────────────── */}
          <section id="authentication" className="scroll-mt-8 space-y-5">
            <SectionHeading id="authentication">Authentication</SectionHeading>
            <Paragraph>
              Send your API key on every request as the{' '}
              <InlineCode>x-api-key</InlineCode> header (same as in the
              dashboard &quot;Example request&quot; snippet).
            </Paragraph>
            <CodeBlock
              title="Request header"
              code={`x-api-key: YOUR_API_KEY`}
            />
            <CalloutInfo>
              Get your API key from the{' '}
              <Link
                href="/dashboard/keys"
                className="font-medium underline underline-offset-2 hover:text-foreground"
                style={{ color: 'var(--accent)' }}
              >
                dashboard
              </Link>
              . Free keys are available immediately after sign-up — no credit
              card required.
            </CalloutInfo>
            <CalloutWarning>
              Never expose your API key in client-side code or public
              repositories. Rotate it from the dashboard if compromised.
            </CalloutWarning>
          </section>

          <Divider />

          {/* ── Quick start ──────────────────────────────────── */}
          <section id="quickstart" className="scroll-mt-8 space-y-5">
            <SectionHeading id="quickstart">Quick start</SectionHeading>
            <Paragraph>
              Create a key under{' '}
              <Link
                href="/dashboard/keys"
                className="font-medium underline underline-offset-2 hover:text-foreground"
                style={{ color: 'var(--accent)' }}
              >
                API Keys
              </Link>
              , then run (replace <InlineCode>YOUR_API_KEY</InlineCode>):
            </Paragraph>
            <CodeBlock
              title="curl"
              code={`curl -sS "${BASE_URL}/api/verify/01-5713" \\
  -H "x-api-key: YOUR_API_KEY"`}
            />
            <CalloutInfo>
              Use <InlineCode>encodeURIComponent</InlineCode> on the path
              segment if the registration contains characters that need
              encoding.
            </CalloutInfo>
            <JsonBlock
              title="Response — 200 OK (found)"
              json={`{
  "ok": true,
  "product": {
    "nafdac": "01-5713",
    "name": "Example product name",
    "category": "Food",
    "source": "nafdac-registration",
    "manufacturer": "Example manufacturer",
    "approvedDate": "2019-04-01T00:00:00.000Z",
    "expiryDate": "2024-04-01T00:00:00.000Z",
    "ingredients": []
  }
}`}
            />
            <JsonBlock
              title="Response — 404 (not found)"
              json={`{
  "ok": false,
  "code": "NOT_FOUND",
  "message": "Product not found for this NAFDAC number",
  "nafdac": "99-9999"
}`}
            />
          </section>

          <Divider />

          {/* ── Endpoints ────────────────────────────────────── */}
          <section id="endpoints" className="scroll-mt-8">
            <SectionHeading id="endpoints">Endpoints</SectionHeading>

            {/* GET /api/verify/:nafdac */}
            <div id="verify-endpoint" className="mt-8 scroll-mt-8 space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <SubHeading id="verify-endpoint">Verify a product</SubHeading>
                <div className="flex gap-2">
                  <FreeBadge />
                  <ProBadge />
                </div>
              </div>
              <Paragraph>
                Look up one registration number. Returns{' '}
                <InlineCode>ok: true</InlineCode> and a{' '}
                <InlineCode>product</InlineCode> object when found, or{' '}
                <InlineCode>404</InlineCode> with{' '}
                <InlineCode>NOT_FOUND</InlineCode> when not. Counts as one
                monthly API use (Free or Pro).
              </Paragraph>
              <EndpointTag method="GET" path="/api/verify/:nafdac" />
              <div>
                <p className="mb-3 text-[13px] font-semibold text-foreground">
                  Path
                </p>
                <Table>
                  <ParamRow
                    name="nafdac"
                    type="string"
                    required
                    description="NAFDAC registration number (e.g. 01-5713, A1-5645). Pass raw or URL-encoded in the path."
                  />
                </Table>
              </div>
              <CodeBlock
                title="Request"
                code={`curl -sS "${BASE_URL}/api/verify/01-5713" \\
  -H "x-api-key: YOUR_API_KEY"`}
              />
              <JsonBlock
                title="Response — 200 (found)"
                json={`{
  "ok": true,
  "product": {
    "nafdac": "01-5713",
    "name": "…",
    "category": "Food",
    "source": "nafdac-registration",
    "manufacturer": "…",
    "approvedDate": "2019-04-01T00:00:00.000Z",
    "expiryDate": "2024-04-01T00:00:00.000Z",
    "ingredients": ["…"]
  }
}`}
              />
              <JsonBlock
                title="Response — 404 (not found)"
                json={`{
  "ok": false,
  "code": "NOT_FOUND",
  "message": "Product not found for this NAFDAC number",
  "nafdac": "99-9999"
}`}
              />
            </div>

            {/* POST /api/verify/batch */}
            <div id="batch-endpoint" className="mt-14 scroll-mt-8 space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <SubHeading id="batch-endpoint">Batch verify</SubHeading>
                <ProBadge />
              </div>
              <Paragraph>
                Up to 40 numbers per request. Each row (found or not found)
                counts as one unit toward the same monthly API cap as single
                verify. Requires API Pro — same{' '}
                <InlineCode>x-api-key</InlineCode> header and JSON body{' '}
                <InlineCode>{'{ "nafdac": string[] }'}</InlineCode>.
              </Paragraph>
              <EndpointTag method="POST" path="/api/verify/batch" />
              <CodeBlock
                title="Request"
                code={`curl -sS -X POST "${BASE_URL}/api/verify/batch" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_API_KEY" \\
  -d '{"nafdac":["01-5713","04-8127"]}'`}
              />
              <JsonBlock
                title="Response — 200 OK"
                json={`{
  "ok": true,
  "results": [
    {
      "nafdac": "01-5713",
      "ok": true,
      "product": {
        "nafdac": "01-5713",
        "name": "…",
        "category": "Food",
        "source": "nafdac-registration",
        "manufacturer": "…",
        "approvedDate": null,
        "expiryDate": null,
        "ingredients": []
      }
    },
    {
      "nafdac": "99-9999",
      "ok": false,
      "code": "NOT_FOUND",
      "message": "Product not found for this NAFDAC number"
    }
  ]
}`}
              />
            </div>

            {/* GET /api/products/search */}
            <div id="search-endpoint" className="mt-14 scroll-mt-8 space-y-5">
              <div className="flex flex-wrap items-center gap-3">
                <SubHeading id="search-endpoint">Product search</SubHeading>
                <ProBadge />
              </div>
              <Paragraph>
                API Pro only. Query our indexed product database (built from
                registrations we have seen) — not a live NAFDAC request per
                search. Multi-word <InlineCode>q</InlineCode>: every token must
                match somewhere (any field). Optional{' '}
                <InlineCode>limit</InlineCode> 1–50 (default 20). Each{' '}
                <strong>successful</strong> search response counts one monthly
                unit. Minimum query length: 2 characters.
              </Paragraph>
              <EndpointTag method="GET" path="/api/products/search?q=&limit=" />
              <div>
                <p className="mb-3 text-[13px] font-semibold text-foreground">
                  Query parameters
                </p>
                <Table>
                  <ParamRow
                    name="q"
                    type="string"
                    required
                    description="Search string (≥2 chars). Tokenized; all tokens must match."
                  />
                  <ParamRow
                    name="limit"
                    type="number"
                    description="1–50, default 20."
                  />
                </Table>
              </div>
              <CodeBlock
                title="Request"
                code={`curl -sS "${BASE_URL}/api/products/search?q=sardine&limit=10" \\
  -H "x-api-key: YOUR_API_KEY"`}
              />
              <JsonBlock
                title="Response — 200 OK"
                json={`{
  "ok": true,
  "results": [
    {
      "nafdac": "01-5713",
      "name": "TITUS SARDINE IN VEGETABLE OIL",
      "category": "Food",
      "manufacturer": "UNIMER S.A"
    }
  ]
}`}
              />
            </div>

            {/* Photo verify — Telegram only */}
            <div id="telegram-photo" className="mt-14 scroll-mt-8 space-y-5">
              <SubHeading id="telegram-photo">
                Photo verify (Telegram)
              </SubHeading>
              <Paragraph>
                Label photo OCR and extraction are not exposed on this HTTP API.
                They are available through <strong>Telegram Bot Pro</strong> via{' '}
                <a
                  href="https://t.me/NaijaCheckrBot"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="font-medium text-(--accent) underline underline-offset-2 hover:text-(--accent-hover)"
                >
                  @NaijaCheckrBot
                </a>{' '}
                (<InlineCode>/upgrade</InlineCode>).
              </Paragraph>
              <CalloutInfo>
                Integrators who need images should ask users for the NAFDAC
                number as text, or direct them to the bot for photo verify.
              </CalloutInfo>
            </div>
          </section>

          <Divider />

          {/* ── JavaScript SDK ───────────────────────────────── */}
          <section id="sdk" className="scroll-mt-8 space-y-5">
            <SectionHeading id="sdk">JavaScript SDK</SectionHeading>
            <Paragraph>
              Official <InlineCode>@9jacheckr/sdk</InlineCode> wraps the same
              REST endpoints with typed results. Uses global{' '}
              <InlineCode>fetch</InlineCode> (Node 18+). The client always talks
              to <InlineCode>https://api.9jacheckr.xyz</InlineCode> — for a
              local API, use the HTTP examples above.
            </Paragraph>
            <CalloutWarning>
              Do not ship your API key in browser bundles. Use the SDK on the
              server or in scripts only.
            </CalloutWarning>
            <CodeBlock title="Install" code={`npm install @9jacheckr/sdk`} />
            <Paragraph>
              All methods return a <strong>Promise</strong> that{' '}
              <strong>resolves</strong> (no throw for API/network errors).
              Branch on <InlineCode>result.ok</InlineCode>. Per-request timeout
              is about 25 seconds.
            </Paragraph>
            <SubHeading id="sdk-client">CheckrClient</SubHeading>
            <CodeBlock
              title="ESM"
              code={`import { CheckrClient } from '@9jacheckr/sdk';

const client = new CheckrClient({
  apiKey: process.env.CHECKR_API_KEY!,
});

const result = await client.verify('01-5713');

if (result.ok) {
  console.log(result.product.name, result.product.manufacturer);
} else {
  console.error(result.code, result.message);
}`}
            />
            <div>
              <p className="mb-3 text-[13px] font-semibold text-foreground">
                Methods
              </p>
              <Table>
                <ParamRow
                  name="verify(nafdac)"
                  type="Promise&lt;VerifyResult&gt;"
                  description="GET /api/verify/:nafdac — Free or Pro. Empty input returns ok: false with INVALID_NAFDAC (request not sent)."
                />
                <ParamRow
                  name="verifyBatch(numbers)"
                  type="Promise&lt;BatchVerifyResult&gt;"
                  description="POST /api/verify/batch — API Pro. Up to 40 strings per call; each row counts toward monthly usage. Empty list → INVALID_BODY."
                />
                <ParamRow
                  name="searchProducts(query, { limit? })"
                  type="Promise&lt;SearchResult&gt;"
                  description="GET /api/products/search — API Pro. query ≥ 2 characters; limit 1–50 (default 20). Each successful response counts one monthly unit."
                />
              </Table>
            </div>
            <CodeBlock
              title="Batch (API Pro)"
              code={`const batch = await client.verifyBatch(['01-5713', '04-8127']);

if (batch.ok) {
  for (const row of batch.results) {
    if (row.ok) console.log(row.nafdac, row.product.name);
    else console.log(row.nafdac, row.code, row.message);
  }
} else {
  console.error(batch.code, batch.message);
}`}
            />
            <CodeBlock
              title="Product search (API Pro)"
              code={`const search = await client.searchProducts('sardine', {
  limit: 10,
});

if (search.ok) {
  for (const hit of search.results) {
    console.log(hit.nafdac, hit.name, hit.manufacturer);
  }
} else {
  console.error(search.code, search.message);
}`}
            />
            <Paragraph>
              Exported types include <InlineCode>Product</InlineCode>,{' '}
              <InlineCode>VerifyResult</InlineCode>,{' '}
              <InlineCode>BatchVerifyResult</InlineCode>,{' '}
              <InlineCode>SearchResult</InlineCode>, and row/hit types. Extra
              SDK-only <InlineCode>code</InlineCode> values include{' '}
              <InlineCode>INVALID_RESPONSE</InlineCode>,{' '}
              <InlineCode>TIMEOUT</InlineCode>, and{' '}
              <InlineCode>NETWORK_ERROR</InlineCode>.
            </Paragraph>
            <CalloutInfo>
              Source and README: monorepo path{' '}
              <InlineCode>packages/sdk</InlineCode> (see npm package{' '}
              <InlineCode>@9jacheckr/sdk</InlineCode>).
            </CalloutInfo>
          </section>

          <Divider />

          {/* ── Rate limits ──────────────────────────────────── */}
          <section id="rate-limits" className="scroll-mt-8 space-y-5">
            <SectionHeading id="rate-limits">Rate limits</SectionHeading>
            <Paragraph>
              Two layers: a <strong>monthly usage cap</strong> per account (Free
              vs API Pro) and a <strong>sliding-window limiter</strong> on
              verify, batch, and search routes. Over the monthly cap you get{' '}
              <InlineCode>429</InlineCode> with{' '}
              <InlineCode>PLAN_QUOTA_EXCEEDED</InlineCode>. Over the window
              limit you get <InlineCode>429</InlineCode> with{' '}
              <InlineCode>RATE_LIMITED</InlineCode>.
            </Paragraph>
            <div
              className="overflow-x-auto rounded-xl border"
              style={{ borderColor: 'var(--border)' }}
            >
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr
                    style={{
                      background: 'var(--bg-overlay)',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    {['Plan', 'Monthly usage cap', '~Per 15 min / API key'].map(
                      (h) => (
                        <th
                          key={h}
                          className="px-4 py-3 text-left font-semibold text-foreground"
                        >
                          {h}
                        </th>
                      ),
                    )}
                  </tr>
                </thead>
                <tbody>
                  <tr
                    className="border-b"
                    style={{
                      borderColor: 'var(--border-subtle)',
                      background: 'var(--bg-subtle)',
                    }}
                  >
                    <td className="px-4 py-3">
                      <FreeBadge />
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{ color: 'var(--text-2)' }}
                    >
                      300 units — single GET verify only (no batch/search)
                    </td>
                    <td
                      className="px-4 py-3 font-mono"
                      style={{ color: 'var(--text-2)' }}
                    >
                      45 req / 15 min
                    </td>
                  </tr>
                  <tr style={{ background: 'var(--bg-raised)' }}>
                    <td className="px-4 py-3">
                      <ProBadge />
                    </td>
                    <td
                      className="px-4 py-3"
                      style={{ color: 'var(--text-2)' }}
                    >
                      50,000 units — each verify row + each successful search
                    </td>
                    <td
                      className="px-4 py-3 font-mono"
                      style={{ color: 'var(--text-2)' }}
                    >
                      220 req / 15 min
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <Paragraph>
              Successful responses may include{' '}
              <InlineCode>RateLimit-*</InlineCode> style headers from the
              sliding limiter (draft standard). Monthly remaining usage is shown
              in your dashboard, not only in response headers.
            </Paragraph>
          </section>

          <Divider />

          {/* ── Error codes ──────────────────────────────────── */}
          <section id="errors" className="scroll-mt-8 space-y-5">
            <SectionHeading id="errors">Error codes</SectionHeading>
            <Paragraph>
              All errors follow a consistent shape. The HTTP status indicates
              the category; the <InlineCode>code</InlineCode> field is
              machine-readable.
            </Paragraph>
            <JsonBlock
              title="Error response shape"
              json={`{
  "ok": false,
  "code": "NOT_FOUND",
  "message": "Product not found for this NAFDAC number",
  "nafdac": "99-9999"
}`}
            />
            <div
              className="overflow-x-auto rounded-xl border"
              style={{ borderColor: 'var(--border)' }}
            >
              <table className="w-full border-collapse text-[13px]">
                <thead>
                  <tr
                    style={{
                      background: 'var(--bg-overlay)',
                      borderBottom: '1px solid var(--border)',
                    }}
                  >
                    {['Status', 'Code', 'Meaning'].map((h) => (
                      <th
                        key={h}
                        className="px-4 py-3 text-left font-semibold text-foreground"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {[
                    [
                      '400',
                      'INVALID_NAFDAC',
                      'Missing or empty path parameter',
                    ],
                    [
                      '400',
                      'INVALID_BODY',
                      'Batch: body must include nafdac string array',
                    ],
                    [
                      '400',
                      'INVALID_QUERY',
                      'Search: q too short or no valid tokens',
                    ],
                    ['401', 'UNAUTHORIZED', 'Missing or invalid API key'],
                    [
                      '403',
                      'FEATURE_REQUIRES_PRO',
                      'Batch or search needs API Pro',
                    ],
                    [
                      '403',
                      'KEY_PLAN_DISABLED',
                      'Non-primary key on Free plan',
                    ],
                    [
                      '404',
                      'NOT_FOUND',
                      'No product for this NAFDAC number (verify)',
                    ],
                    ['429', 'PLAN_QUOTA_EXCEEDED', 'Monthly API cap reached'],
                    ['429', 'RATE_LIMITED', 'Sliding window limit hit'],
                    ['500', 'INTERNAL_ERROR', 'Unexpected server error'],
                  ].map(([status, code, meaning]) => (
                    <tr
                      key={code}
                      className="border-b"
                      style={{
                        borderColor: 'var(--border-subtle)',
                        background: 'var(--bg-subtle)',
                      }}
                    >
                      <td
                        className="px-4 py-3 font-mono"
                        style={{ color: 'var(--syn-num)' }}
                      >
                        {status}
                      </td>
                      <td
                        className="px-4 py-3 font-mono text-[12px]"
                        style={{ color: 'var(--text-2)' }}
                      >
                        {code}
                      </td>
                      <td
                        className="px-4 py-3"
                        style={{ color: 'var(--text-2)' }}
                      >
                        {meaning}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          <Divider />

          {/* ── Code examples ────────────────────────────────── */}
          <section id="examples" className="scroll-mt-8 space-y-8">
            <SectionHeading id="examples">Code examples</SectionHeading>

            <div className="space-y-4">
              <SubHeading id="examples">JavaScript / Node.js</SubHeading>
              <CodeBlock
                title="fetch (Node 18+ / browser)"
                code={`const url = \`${BASE_URL}/api/verify/\` + encodeURIComponent("01-5713");
const response = await fetch(url, {
  headers: { "x-api-key": "YOUR_API_KEY" },
});

const data = await response.json();

if (data.ok && data.product) {
  console.log(data.product.name);
}`}
              />
            </div>

            <div className="space-y-4">
              <SubHeading id="examples">Python</SubHeading>
              <CodeBlock
                title="requests"
                code={`import urllib.parse
import requests

nafdac = urllib.parse.quote("01-5713", safe="")
r = requests.get(
    f"${BASE_URL}/api/verify/{nafdac}",
    headers={"x-api-key": "YOUR_API_KEY"},
    timeout=30,
)
data = r.json()
if data.get("ok") and data.get("product"):
    print(data["product"]["name"])`}
              />
            </div>

            <div className="space-y-4">
              <SubHeading id="examples">TypeScript — typed helper</SubHeading>
              <CodeBlock
                title="nafdac.ts"
                code={`const API_KEY = process.env.CHECKR_API_KEY!;
const BASE = "${BASE_URL}";

export type Product = {
  nafdac: string;
  name: string;
  category: string;
  source: string;
  manufacturer: string;
  approvedDate: string | null;
  expiryDate: string | null;
  ingredients: string[];
};

export type VerifySuccess = { ok: true; product: Product };
export type VerifyError = {
  ok: false;
  code: string;
  message: string;
  nafdac?: string;
};

export async function verifyNafdac(
  nafdac: string,
): Promise<VerifySuccess | VerifyError> {
  const path = encodeURIComponent(nafdac);
  const res = await fetch(\`\${BASE}/api/verify/\${path}\`, {
    headers: { "x-api-key": API_KEY },
  });
  return res.json() as Promise<VerifySuccess | VerifyError>;
}`}
              />
            </div>
          </section>

          <Divider />

          {/* ── Upgrade ──────────────────────────────────────── */}
          <section id="upgrade" className="scroll-mt-8 space-y-5">
            <SectionHeading id="upgrade">Upgrade to Pro</SectionHeading>
            <Paragraph>
              Need more than 300 lookups per month, multiple keys, batch verify,
              or product search? Upgrade to API Pro from your dashboard. Billed
              at ₦10,000/month. Photo verify stays on Telegram Bot Pro only.
            </Paragraph>

            <div
              className="overflow-hidden rounded-2xl border"
              style={{
                borderColor: 'var(--accent)',
                background: 'var(--bg-raised)',
              }}
            >
              <div
                className="h-[2px]"
                style={{ background: 'var(--accent)' }}
                aria-hidden
              />
              <div className="p-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-[14px] font-semibold text-foreground">
                      API Pro
                    </p>
                    <p className="mt-1 flex items-baseline gap-1">
                      <span className="text-[2rem] font-bold tracking-tight text-foreground">
                        ₦10,000
                      </span>
                      <span
                        className="text-[13px]"
                        style={{ color: 'var(--text-3)' }}
                      >
                        / month
                      </span>
                    </p>
                  </div>
                  <ProBadge />
                </div>
                <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                  {[
                    '50,000 API uses / month',
                    'Multiple API keys',
                    'POST /api/verify/batch',
                    'GET /api/products/search',
                    'Higher sliding-window limits',
                    'Dashboard metrics',
                    'Commercial use',
                  ].map((f) => (
                    <li
                      key={f}
                      className="flex items-center gap-2 text-[13px]"
                      style={{ color: 'var(--text-2)' }}
                    >
                      <Check
                        className="h-3.5 w-3.5 shrink-0"
                        strokeWidth={2.5}
                        style={{ color: 'var(--accent)' }}
                      />
                      {f}
                    </li>
                  ))}
                </ul>
                <Link
                  href="/dashboard/keys"
                  className="mt-6 inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-[14px] font-semibold text-black transition-opacity hover:opacity-90"
                  style={{ background: 'var(--accent)' }}
                >
                  Upgrade in dashboard
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>

            <CalloutInfo>
              Questions or need a custom volume plan?{' '}
              <a
                href="mailto:devemmanuel1@gmail.com?subject=9ja Checkr API Pro"
                className="font-medium underline underline-offset-2 hover:text-foreground"
                style={{ color: 'var(--accent)' }}
              >
                Email us
              </a>
              .
            </CalloutInfo>
          </section>

          {/* Bottom nav */}
          <div
            className="mt-16 flex flex-wrap items-center gap-x-6 gap-y-2 border-t pt-10 text-[13px]"
            style={{
              borderColor: 'var(--border-subtle)',
              color: 'var(--text-3)',
            }}
          >
            <Link href="/" className="transition-colors hover:text-foreground">
              ← Home
            </Link>
            <Link
              href="/dashboard"
              className="transition-colors hover:text-foreground"
            >
              Dashboard
            </Link>
            <a
              href="mailto:devemmanuel1@gmail.com?subject=9ja Checkr API"
              className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
            >
              Support <ExternalLink className="h-3 w-3" />
            </a>
            <Link
              href="/disclaimer"
              className="transition-colors hover:text-foreground"
            >
              Disclaimer
            </Link>
          </div>
        </div>
      </main>
    </>
  );
}
