'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BookOpen,
  Key,
  LayoutDashboard,
  LogOut,
  Mail,
  Settings,
} from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { ThemeToggle } from '@/components/theme-toggle';
import { ApiProUpgradeCta } from '@/components/dashboard/api-pro-upgrade-cta';
import { DashboardProLabel } from '@/components/dashboard/dashboard-pro-label';
import { SUPPORT_MAILTO } from '@/lib/support';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/keys', label: 'API Keys', icon: Key, exact: false },
  {
    href: '/dashboard/settings',
    label: 'Settings',
    icon: Settings,
    exact: true,
  },
] as const;

export function DashboardShell({
  children,
  apiBaseUrl = '',
}: {
  children: React.ReactNode;
  apiBaseUrl?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { data: session } = authClient.useSession();
  const user = session?.user;

  async function signOut() {
    await authClient.signOut();
    router.replace('/');
    router.refresh();
  }

  function isActive(href: string, exact: boolean) {
    return exact ? pathname === href : pathname.startsWith(href);
  }

  return (
    <div className="page-bg flex h-dvh min-h-0 overflow-hidden">
      <aside className="sidebar hidden min-h-0 min-w-0 flex-col lg:flex">
        <div
          className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-3"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <Link
            href="/"
            className="group flex min-w-0 flex-1 items-center gap-2 text-[14px] font-semibold text-foreground"
          >
            <span className="logo-badge flex h-6 w-6 shrink-0 items-center justify-center rounded-[5px] text-[12px] font-bold text-black">
              9
            </span>
            <span className="truncate">9ja Checkr</span>
          </Link>
          <ThemeToggle className="shrink-0" />
        </div>

        <nav
          className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden p-2"
          aria-label="Sidebar"
        >
          <ul className="space-y-0.5">
            {NAV.map(({ href, label, icon: Icon, exact }) => {
              const active = isActive(href, exact);
              return (
                <li key={href}>
                  <Link
                    href={href}
                    className={cn(
                      'flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium transition-colors',
                      active
                        ? 'bg-(--nav-active-bg) text-foreground'
                        : 'text-(--text-2) hover:bg-(--nav-hover-bg) hover:text-foreground',
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0 transition-colors',
                        active ? 'text-(--accent)' : 'text-(--text-3)',
                      )}
                      strokeWidth={active ? 2 : 1.75}
                    />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>

          {apiBaseUrl ? (
            <div className="mt-4 min-w-0 px-0.5">
              <ApiProUpgradeCta apiBaseUrl={apiBaseUrl} variant="sidebar" />
            </div>
          ) : null}

          <div
            className="mt-4 border-t pt-4"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <a
              href="/#developers"
              className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium text-(--text-2) transition-colors hover:bg-(--nav-hover-bg) hover:text-foreground"
            >
              <BookOpen
                className="h-4 w-4 shrink-0 text-(--text-3)"
                strokeWidth={1.75}
              />
              API Reference
            </a>
            <a
              href={SUPPORT_MAILTO}
              className="mt-0.5 flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium text-(--text-2) transition-colors hover:bg-(--nav-hover-bg) hover:text-foreground focus-visible-ring"
            >
              <Mail
                className="h-4 w-4 shrink-0 text-(--text-3)"
                strokeWidth={1.75}
              />
              Email support
            </a>
          </div>
        </nav>

        <div
          className="shrink-0 border-t p-3"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          {user ? (
            <div
              className="mb-2 rounded-md border px-3 py-2.5"
              style={{
                borderColor: 'var(--border-subtle)',
                background: 'var(--bg-raised)',
              }}
            >
              {user.name ? (
                <div className="flex min-w-0 items-center gap-2">
                  <p className="min-w-0 truncate text-[12px] font-medium text-foreground">
                    {user.name}
                  </p>
                  {apiBaseUrl ? (
                    <DashboardProLabel apiBaseUrl={apiBaseUrl} />
                  ) : null}
                </div>
              ) : apiBaseUrl ? (
                <div className="mb-0.5">
                  <DashboardProLabel apiBaseUrl={apiBaseUrl} />
                </div>
              ) : null}
              <p className="truncate text-[11px] text-(--text-3)">
                {user.email}
              </p>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => void signOut()}
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-[13px] font-medium text-(--text-2) transition-colors hover:bg-(--nav-hover-bg) hover:text-foreground focus-visible-ring"
          >
            <LogOut
              className="h-3.5 w-3.5 shrink-0 text-(--text-3)"
              strokeWidth={1.75}
            />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <header
          className="flex min-h-14 shrink-0 flex-wrap items-center justify-between gap-x-3 gap-y-2 border-b px-3 py-2 backdrop-blur-md sm:px-4 lg:hidden"
          style={{
            borderColor: 'var(--border-subtle)',
            background: 'var(--header-surface)',
          }}
        >
          <Link
            href="/"
            className="group flex min-w-0 shrink items-center gap-2 text-[14px] font-semibold text-foreground"
          >
            <span className="logo-badge flex h-6 w-6 shrink-0 items-center justify-center rounded-[5px] text-[12px] font-bold text-black">
              9
            </span>
            <span className="truncate">9ja Checkr</span>
          </Link>
          <div className="flex min-w-0 flex-1 flex-wrap items-center justify-end gap-x-2 gap-y-1 sm:flex-none sm:flex-nowrap">
            {apiBaseUrl ? (
              <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                <DashboardProLabel apiBaseUrl={apiBaseUrl} />
                <ApiProUpgradeCta apiBaseUrl={apiBaseUrl} variant="navbar" />
              </div>
            ) : null}
            <div className="flex shrink-0 items-center gap-1 sm:gap-2">
              <a
                href={SUPPORT_MAILTO}
                className="flex h-9 w-9 items-center justify-center rounded-md text-(--text-2) transition-colors hover:bg-(--nav-hover-bg) hover:text-foreground focus-visible-ring"
                aria-label="Email support"
              >
                <Mail className="h-4 w-4 shrink-0" strokeWidth={1.75} />
              </a>
              <ThemeToggle />
              <button
                type="button"
                onClick={() => void signOut()}
                className="text-[13px] text-(--text-2) transition-colors hover:text-foreground"
              >
                Sign out
              </button>
            </div>
          </div>
        </header>

        <div
          className="flex shrink-0 border-b lg:hidden"
          style={{
            borderColor: 'var(--border-subtle)',
            background: 'var(--bg-subtle)',
          }}
        >
          {NAV.map(({ href, label, icon: Icon, exact }) => {
            const active = isActive(href, exact);
            return (
              <Link
                key={href}
                href={href}
                className={cn(
                  'flex flex-1 items-center justify-center gap-1.5 border-b-2 py-3 text-[13px] font-medium transition-colors',
                  active
                    ? 'border-(--accent) text-foreground'
                    : 'border-transparent text-(--text-2) hover:text-foreground',
                )}
              >
                <Icon
                  className={cn('h-3.5 w-3.5', active && 'text-(--accent)')}
                  strokeWidth={active ? 2 : 1.75}
                />
                {label}
              </Link>
            );
          })}
        </div>

        <main className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mx-auto max-w-3xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
