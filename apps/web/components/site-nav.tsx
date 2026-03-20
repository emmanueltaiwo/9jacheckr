import Link from 'next/link';
import { cn } from '@/lib/utils';

type SiteNavProps = {
  variant?: 'marketing' | 'minimal';
  /** When true, show “Back” instead of Sign in (e.g. login page). */
  authFlow?: boolean;
  /** When true (marketing only), primary nav action goes to the dashboard. */
  isSignedIn?: boolean;
  className?: string;
};

export function SiteNav({
  variant = 'marketing',
  authFlow = false,
  isSignedIn = false,
  className,
}: SiteNavProps) {
  return (
    <header
      className={cn(
        'sticky top-0 z-50 border-b border-white/5 bg-[#050504]/85 backdrop-blur-xl',
        className,
      )}
    >
      <div className="mx-auto flex h-[3.75rem] max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link
          href="/"
          className="group flex items-center gap-2.5 font-semibold tracking-tight text-[#eceae1]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#dfff1f] text-sm font-bold text-black shadow-[0_0_16px_-4px_rgba(223,255,31,0.4)] transition group-hover:bg-[#f0ff6a]">
            9
          </span>
          <span className="hidden text-[15px] sm:inline">9ja Checkr</span>
        </Link>

        <nav className="flex items-center gap-1 sm:gap-2">
          {variant === 'marketing' ? (
            <>
              <a
                href="#product"
                className="hidden rounded-lg px-3 py-1.5 text-[13px] font-medium text-stone-500 transition hover:bg-white/[0.04] hover:text-stone-300 sm:inline"
              >
                About
              </a>
              <a
                href="#api"
                className="hidden rounded-lg px-3 py-1.5 text-[13px] font-medium text-stone-500 transition hover:bg-white/[0.04] hover:text-stone-300 md:inline"
              >
                API
              </a>
            </>
          ) : null}
          {authFlow ? (
            <Link
              href="/"
              className="rounded-lg px-3 py-1.5 text-[13px] font-medium text-stone-500 transition hover:bg-white/[0.04] hover:text-stone-300"
            >
              ← Home
            </Link>
          ) : isSignedIn ? (
            <Link
              href="/dashboard"
              className="rounded-lg border border-[#dfff1f]/40 bg-[#dfff1f] px-3 py-1.5 text-[13px] font-semibold text-black transition hover:border-[#dfff1f] hover:bg-[#f0ff6a]"
            >
              Dashboard
            </Link>
          ) : (
            <Link
              href="/login"
              className="rounded-lg border border-white/10 bg-transparent px-3 py-1.5 text-[13px] font-medium text-[#eceae1] transition hover:border-[#dfff1f]/50 hover:bg-[#dfff1f] hover:text-black"
            >
              Sign in
            </Link>
          )}
        </nav>
      </div>
    </header>
  );
}
