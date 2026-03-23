import Link from 'next/link';
import { SUPPORT_MAILTO, SUPPORT_PAYSTACK_URL } from '@/lib/support';

export function SiteFooter() {
  return (
    <footer
      className="relative border-t overflow-hidden"
      style={{ borderColor: 'var(--border-subtle)', background: 'var(--bg)' }}
    >
      <div
        className="pointer-events-none absolute -bottom-8 -right-4 select-none text-[clamp(14rem,30vw,24rem)] font-bold leading-none opacity-[0.03]"
        style={{ color: 'var(--accent)', lineHeight: 1 }}
        aria-hidden
      >
        9
      </div>

      <div className="relative mx-auto max-w-5xl px-4 py-14 sm:px-6 sm:py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="flex items-center gap-2.5">
              <span className="logo-badge flex h-8 w-8 items-center justify-center rounded-lg text-[13px] font-bold text-black">
                9
              </span>
              <span className="text-[15px] font-semibold text-foreground">
                9ja Checkr
              </span>
            </div>
            <p
              className="mt-3 text-[13px] leading-relaxed"
              style={{ color: 'var(--text-3)' }}
            >
              Independent NAFDAC registration lookup — not affiliated with
              NAFDAC. Not a government service; see the disclaimer.
            </p>
            <a
              href={SUPPORT_PAYSTACK_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1.5 text-[12px] transition-colors hover:text-(--accent)"
              style={{ color: 'var(--text-3)' }}
            >
              ♥ Support the project
            </a>
          </div>

          <div>
            <p
              className="mb-4 text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: 'var(--text-3)' }}
            >
              Product
            </p>
            <ul className="space-y-3">
              {[
                { label: 'Verify a product', href: '/verify' },
                { label: 'How it works', href: '/#how-it-works' },
                { label: 'Pricing', href: '/#pricing' },
                { label: 'Disclaimer', href: '/disclaimer' },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-[13px] transition-colors hover:text-foreground"
                    style={{ color: 'var(--text-2)' }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p
              className="mb-4 text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: 'var(--text-3)' }}
            >
              Developers
            </p>
            <ul className="space-y-3">
              {[
                { label: 'API docs', href: '/docs' },
                { label: 'Dashboard', href: '/dashboard' },
                {
                  label: 'Get API key',
                  href: '/login?next=/dashboard',
                },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    href={l.href}
                    className="text-[13px] transition-colors hover:text-foreground"
                    style={{ color: 'var(--text-2)' }}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p
              className="mb-4 text-[11px] font-semibold uppercase tracking-widest"
              style={{ color: 'var(--text-3)' }}
            >
              Support
            </p>
            <ul className="space-y-3">
              {[
                {
                  label: 'Telegram bot',
                  href: 'https://t.me/NaijaCheckrBot',
                },
                { label: 'Email support', href: SUPPORT_MAILTO },
                {
                  label: 'Status page',
                  href: 'https://status.9jacheckr.xyz',
                },
              ].map((l) => (
                <li key={l.label}>
                  <a
                    href={l.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[13px] transition-colors hover:text-foreground"
                    style={{ color: 'var(--text-2)' }}
                  >
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div
          className="mt-12 flex flex-wrap items-center justify-between gap-4 border-t pt-8"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>
            © {new Date().getFullYear()} 9ja Checkr · Independent · Not
            affiliated with NAFDAC
          </p>
          <p className="text-[12px]" style={{ color: 'var(--text-3)' }}>
            Made in Nigeria 🇳🇬
          </p>
        </div>
      </div>
    </footer>
  );
}
