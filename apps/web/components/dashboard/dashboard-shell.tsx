'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { BookOpen, Key, LayoutDashboard, LogOut } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { cn } from '@/lib/utils';

const NAV = [
  { href: '/dashboard', label: 'Overview', icon: LayoutDashboard, exact: true },
  { href: '/dashboard/keys', label: 'API Keys', icon: Key, exact: false },
] as const;

export function DashboardShell({ children }: { children: React.ReactNode }) {
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
    <div className="page-bg flex min-h-dvh">
      <aside className="sidebar hidden flex-col lg:flex">
        <div
          className="flex h-14 shrink-0 items-center px-4 border-b"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <Link
            href="/"
            className="group flex items-center gap-2 text-[14px] font-semibold text-[var(--text)]"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-[5px] bg-[#dfff1f] text-[12px] font-bold text-black transition group-hover:bg-[#eaff5e]">
              9
            </span>
            9ja Checkr
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-2" aria-label="Sidebar">
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
                        ? 'bg-white/8 text-[var(--text)]'
                        : 'text-[var(--text-2)] hover:bg-white/5 hover:text-[var(--text)]',
                    )}
                  >
                    <Icon
                      className={cn(
                        'h-4 w-4 shrink-0 transition-colors',
                        active ? 'text-[#dfff1f]' : 'text-[var(--text-3)]',
                      )}
                      strokeWidth={active ? 2 : 1.75}
                    />
                    {label}
                  </Link>
                </li>
              );
            })}
          </ul>

          <div
            className="mt-4 border-t pt-4"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <a
              href="/#api"
              className="flex items-center gap-2.5 rounded-md px-2.5 py-2 text-[13px] font-medium text-[var(--text-2)] transition-colors hover:bg-white/5 hover:text-[var(--text)]"
            >
              <BookOpen
                className="h-4 w-4 shrink-0 text-[var(--text-3)]"
                strokeWidth={1.75}
              />
              API Reference
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
                <p className="truncate text-[12px] font-medium text-[var(--text)]">
                  {user.name}
                </p>
              ) : null}
              <p className="truncate text-[11px] text-[var(--text-3)]">
                {user.email}
              </p>
            </div>
          ) : null}
          <button
            type="button"
            onClick={() => void signOut()}
            className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-[13px] font-medium text-[var(--text-2)] transition-colors hover:bg-white/5 hover:text-[var(--text)] focus-visible-ring"
          >
            <LogOut
              className="h-3.5 w-3.5 shrink-0 text-[var(--text-3)]"
              strokeWidth={1.75}
            />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col overflow-hidden">
        <header
          className="flex h-14 shrink-0 items-center justify-between border-b px-4 backdrop-blur-md lg:hidden"
          style={{
            borderColor: 'var(--border-subtle)',
            background: 'rgba(6,6,6,0.9)',
          }}
        >
          <Link
            href="/"
            className="group flex items-center gap-2 text-[14px] font-semibold text-[var(--text)]"
          >
            <span className="flex h-6 w-6 items-center justify-center rounded-[5px] bg-[#dfff1f] text-[12px] font-bold text-black">
              9
            </span>
            9ja Checkr
          </Link>
          <button
            type="button"
            onClick={() => void signOut()}
            className="text-[13px] text-[var(--text-2)] transition-colors hover:text-[var(--text)]"
          >
            Sign out
          </button>
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
                    ? 'border-[#dfff1f] text-[var(--text)]'
                    : 'border-transparent text-[var(--text-2)] hover:text-[var(--text)]',
                )}
              >
                <Icon className="h-3.5 w-3.5" strokeWidth={active ? 2 : 1.75} />
                {label}
              </Link>
            );
          })}
        </div>

        <main className="flex-1 overflow-y-auto px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
          <div className="mx-auto max-w-3xl">{children}</div>
        </main>
      </div>
    </div>
  );
}
