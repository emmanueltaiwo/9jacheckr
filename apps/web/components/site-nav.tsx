'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { MarketingNavActions } from '@/components/marketing-nav-actions';
import { ThemeToggle } from '@/components/theme-toggle';
import { cn } from '@/lib/utils';

const NAV_LINKS = [
  { href: '/#how-it-works', label: 'How it works' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/#developers', label: 'API' },
  { href: 'https://status.9jacheckr.xyz', label: 'Status', external: true },
] as const;

export function SiteNav() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 12);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [menuOpen]);

  return (
    <>
      {/* ── Floating nav bar ──────────────────────────────────── */}
      <header className="fixed top-0 left-0 right-0 z-40 flex justify-center px-4 pt-4 pointer-events-none">
        <div
          className={cn(
            'pointer-events-auto flex h-12 w-full max-w-4xl items-center justify-between gap-4 rounded-full px-3 pl-4 transition-all duration-300',
            scrolled
              ? 'shadow-[0_8px_32px_-8px_rgba(0,0,0,0.5),0_0_0_1px_rgba(255,255,255,0.06)]'
              : '',
          )}
          style={{
            background: scrolled
              ? 'color-mix(in srgb, var(--bg) 85%, transparent)'
              : 'color-mix(in srgb, var(--bg) 70%, transparent)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border-subtle)',
          }}
        >
          {/* Logo */}
          <Link
            href="/"
            onClick={() => setMenuOpen(false)}
            className="group flex shrink-0 items-center gap-2 text-foreground"
          >
            <span className="logo-badge flex h-7 w-7 items-center justify-center rounded-lg text-[12px] font-bold text-black">
              9
            </span>
            <span className="hidden text-[14px] font-semibold tracking-tight sm:block">
              9ja Checkr
            </span>
          </Link>

          {/* Desktop nav links */}
          <nav
            className="hidden items-center gap-0.5 lg:flex"
            aria-label="Primary"
          >
            {NAV_LINKS.map((item) =>
              'external' in item ? (
                <a
                  key={item.href}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full px-3.5 py-1.5 text-[13px] transition-colors hover:bg-(--nav-hover-bg)"
                  style={{ color: 'var(--text-2)' }}
                >
                  {item.label}
                </a>
              ) : (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-full px-3.5 py-1.5 text-[13px] transition-colors hover:bg-(--nav-hover-bg)"
                  style={{ color: 'var(--text-2)' }}
                >
                  {item.label}
                </Link>
              ),
            )}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-2">
            <div className="hidden lg:block">
              <ThemeToggle />
            </div>
            <MarketingNavActions />
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="flex h-8 w-8 items-center justify-center rounded-full text-foreground transition-colors hover:bg-(--nav-hover-bg) focus-visible-ring lg:hidden"
              aria-expanded={menuOpen}
              aria-label="Open menu"
            >
              <Menu className="h-[18px] w-[18px]" strokeWidth={2} />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer — rendered at root level, not inside header ── */}
      <div
        className={cn(
          'fixed inset-0 z-[300] lg:hidden transition-opacity duration-300',
          menuOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none',
        )}
        aria-hidden={!menuOpen}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0"
          style={{ background: 'rgba(0,0,0,0.6)' }}
          onClick={() => setMenuOpen(false)}
        />

        {/* Slide-up panel */}
        <div
          className={cn(
            'absolute bottom-0 left-0 right-0 flex flex-col rounded-t-3xl transition-transform duration-300 ease-out',
            menuOpen ? 'translate-y-0' : 'translate-y-full',
          )}
          style={{
            background: 'var(--bg)',
            border: '1px solid var(--border)',
            borderBottom: 'none',
            maxHeight: '88dvh',
          }}
        >
          {/* Handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div
              className="h-1 w-10 rounded-full"
              style={{ background: 'var(--border)' }}
              aria-hidden
            />
          </div>

          {/* Panel header */}
          <div
            className="flex items-center justify-between px-5 pb-4 pt-2"
            style={{ borderBottom: '1px solid var(--border-subtle)' }}
          >
            <div className="flex items-center gap-2">
              <span className="logo-badge flex h-7 w-7 items-center justify-center rounded-lg text-[12px] font-bold text-black">
                9
              </span>
              <span className="text-[14px] font-semibold">9ja Checkr</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ThemeToggle />
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-(--text-2) transition-colors hover:bg-(--nav-hover-bg) hover:text-foreground focus-visible-ring"
                aria-label="Close"
              >
                <X className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Links */}
          <nav className="overflow-y-auto px-3 pt-2 pb-6" aria-label="Mobile">
            <Link
              href="/verify"
              onClick={() => setMenuOpen(false)}
              className="mb-3 flex items-center justify-center rounded-2xl py-3.5 text-[15px] font-semibold text-black"
              style={{ background: 'var(--accent)' }}
            >
              Verify a product →
            </Link>
            <div className="space-y-0.5">
              {NAV_LINKS.map((item) =>
                'external' in item ? (
                  <a
                    key={item.href}
                    href={item.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center rounded-xl px-4 py-3 text-[15px] transition-colors hover:bg-(--nav-hover-bg)"
                    style={{ color: 'var(--text-2)' }}
                  >
                    {item.label}
                    <span
                      className="ml-1 text-[11px]"
                      style={{ color: 'var(--text-3)' }}
                    >
                      ↗
                    </span>
                  </a>
                ) : (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="flex items-center rounded-xl px-4 py-3 text-[15px] transition-colors hover:bg-(--nav-hover-bg)"
                    style={{ color: 'var(--text-2)' }}
                  >
                    {item.label}
                  </Link>
                ),
              )}
              <Link
                href="/disclaimer"
                onClick={() => setMenuOpen(false)}
                className="flex items-center rounded-xl px-4 py-3 text-[15px] transition-colors hover:bg-(--nav-hover-bg)"
                style={{ color: 'var(--text-2)' }}
              >
                Disclaimer
              </Link>
            </div>
          </nav>
        </div>
      </div>
    </>
  );
}
