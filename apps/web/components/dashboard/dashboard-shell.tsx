'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BookOpen, Home, KeyRound, LineChart, LogOut } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { clearSessionBearer } from '@/lib/session-bearer';
import { cn } from '@/lib/utils';

const MAIN_NAV = [
  {
    href: '/dashboard',
    label: 'Home',
    icon: Home,
    match: (p: string) => p === '/dashboard',
  },
  {
    href: '/dashboard/key',
    label: 'API key',
    icon: KeyRound,
    match: (p: string) => p.startsWith('/dashboard/key'),
  },
  {
    href: '/dashboard/usage',
    label: 'Usage',
    icon: LineChart,
    match: (p: string) => p.startsWith('/dashboard/usage'),
  },
] as const;

type DashboardShellProps = {
  email: string;
  apiBaseUrl: string;
  children: React.ReactNode;
};

export function DashboardShell({
  email,
  apiBaseUrl,
  children,
}: DashboardShellProps) {
  const pathname = usePathname();
  const displayBase = apiBaseUrl.replace(/\/$/, '') || 'Set API URL in env';

  return (
    <div className="bg-app relative min-h-dvh text-[#eceae1] lg:flex">
      <div
        className="bg-grid pointer-events-none fixed inset-0 opacity-40 lg:opacity-50"
        aria-hidden
      />

      <aside className="relative z-10 hidden w-[15.5rem] shrink-0 flex-col border-r border-white/10 bg-[#030302]/95 backdrop-blur-md lg:flex lg:min-h-dvh">
        <div className="flex h-[3.75rem] items-center gap-2.5 border-b border-white/10 px-4">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-semibold tracking-tight"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#dfff1f] text-sm font-bold text-black shadow-[0_0_20px_-4px_rgba(223,255,31,0.45)]">
              9
            </span>
            <span className="truncate text-[15px]">9ja Checkr</span>
          </Link>
        </div>

        <nav className="flex flex-col gap-1 p-3" aria-label="Dashboard">
          <p className="mb-1 px-3 text-[10px] font-semibold uppercase tracking-[0.14em] text-stone-600">
            Menu
          </p>
          {MAIN_NAV.map(({ href, label, icon: Icon, match }) => {
            const active = match(pathname);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium transition-all duration-200',
                  active
                    ? 'bg-[#dfff1f]/10 text-[#eceae1] shadow-[inset_0_0_0_1px_rgba(223,255,31,0.18)]'
                    : 'text-stone-500 hover:bg-white/[0.04] hover:text-stone-300',
                )}
              >
                <Icon
                  className={cn(
                    'h-[1.125rem] w-[1.125rem] shrink-0',
                    active ? 'text-[#dfff1f]' : '',
                  )}
                  strokeWidth={2}
                />
                {label}
              </Link>
            );
          })}
          <a
            href="/#api"
            className="mt-3 flex items-center gap-3 rounded-xl px-3 py-2.5 text-[14px] font-medium text-stone-500 transition-colors hover:bg-white/[0.04] hover:text-stone-300"
          >
            <BookOpen
              className="h-[1.125rem] w-[1.125rem] shrink-0"
              strokeWidth={2}
            />
            API docs
          </a>
        </nav>

        <div className="mx-3 mt-5 rounded-xl border border-white/10 bg-[#080807]/80 p-3.5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.12em] text-stone-600">
            Base URL
          </p>
          <p className="mt-2 break-all font-mono text-[11px] leading-relaxed text-[#dfff1f]/95">
            {displayBase}
          </p>
        </div>

        <div className="mt-auto border-t border-white/10 p-4">
          <p className="truncate text-[13px] text-stone-500" title={email}>
            {email}
          </p>
          <button
            type="button"
            onClick={async () => {
              clearSessionBearer();
              await authClient.signOut();
              window.location.href = '/';
            }}
            className="mt-3 flex w-full items-center gap-2 rounded-xl px-3 py-2.5 text-left text-[14px] font-medium text-stone-500 transition-colors hover:bg-red-500/10 hover:text-red-300"
          >
            <LogOut className="h-4 w-4" strokeWidth={2} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="relative z-10 flex min-h-dvh flex-1 flex-col pb-[4.5rem] lg:pb-0">
        <header className="sticky top-0 z-40 flex h-[3.75rem] items-center justify-between border-b border-white/10 bg-[#050504]/90 px-4 backdrop-blur-md lg:hidden">
          <Link
            href="/dashboard"
            className="font-display text-[17px] font-semibold tracking-tight text-[#eceae1]"
          >
            Dashboard
          </Link>
          <a
            href="/#api"
            className="text-[13px] font-medium text-stone-500 hover:text-stone-300"
          >
            Docs
          </a>
        </header>
        <main className="flex-1 px-4 py-7 sm:px-6 sm:py-9 lg:px-12 lg:py-11">
          <div className="mx-auto max-w-xl">{children}</div>
        </main>
      </div>

      <nav
        className="fixed bottom-0 left-0 right-0 z-50 flex items-stretch justify-around border-t border-white/10 bg-[#030302]/95 px-1 pt-1.5 backdrop-blur-lg pb-[max(0.5rem,env(safe-area-inset-bottom))] lg:hidden"
        aria-label="Dashboard mobile"
      >
        {MAIN_NAV.map(({ href, label, icon: Icon, match }) => {
          const active = match(pathname);
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex min-w-0 flex-1 flex-col items-center gap-0.5 rounded-xl py-2.5 text-[10px] font-semibold uppercase tracking-wide transition-colors',
                active ? 'text-[#dfff1f]' : 'text-stone-500',
              )}
            >
              <Icon className="h-5 w-5" strokeWidth={2} />
              <span className="truncate px-0.5">{label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
