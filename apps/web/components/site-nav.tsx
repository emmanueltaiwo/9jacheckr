import Link from 'next/link';
import { MarketingNavActions } from '@/components/marketing-nav-actions';
import { ThemeToggle } from '@/components/theme-toggle';

export function SiteNav() {
  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-xl"
      style={{
        borderColor: 'var(--border-subtle)',
        background: 'var(--header-surface)',
      }}
    >
      <div className="mx-auto flex h-14 max-w-[1120px] min-w-0 items-center justify-between gap-3 px-5 sm:px-6">
        <div className="flex min-w-0 items-center gap-4 md:gap-6">
          <Link
            href="/"
            className="group flex items-center gap-2 text-[14px] font-semibold text-foreground"
          >
            <span className="logo-badge flex h-[26px] w-[26px] items-center justify-center rounded-[5px] text-[12px] font-bold text-black">
              9
            </span>
            9ja Checkr
          </Link>

          <nav className="hidden items-center gap-0.5 md:flex">
            <Link href="/#features" className="btn-ghost">
              Features
            </Link>
            <Link href="/verify" className="btn-ghost">
              Verify
            </Link>
            <Link href="/#pricing" className="btn-ghost">
              Pricing
            </Link>
            <Link href="/#api" className="btn-ghost">
              API
            </Link>
            <a
              href="https://t.me/NaijaCheckrBot"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-ghost"
            >
              Telegram
            </a>
          </nav>
        </div>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          <Link
            href="/verify"
            className="btn-ghost h-8 md:hidden focus-visible-ring"
          >
            Verify
          </Link>
          <ThemeToggle />
          <MarketingNavActions />
        </div>
      </div>
    </header>
  );
}
