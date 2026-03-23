import { Suspense } from 'react';
import Link from 'next/link';
import { ArrowLeft, Code2, ShieldCheck, Zap } from 'lucide-react';
import { LoginForm } from '@/components/login/login-form';
import { ThemeToggle } from '@/components/theme-toggle';

export default function LoginPage() {
  return (
    <div
      className="flex min-h-dvh w-full"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      {/* ── Left panel — brand (desktop only) ──────────────── */}
      <div
        className="relative hidden flex-col justify-between overflow-hidden px-10 py-10 lg:flex lg:w-[420px] lg:shrink-0"
        style={{
          background: 'var(--bg-subtle)',
          borderRight: '1px solid var(--border-subtle)',
        }}
      >
        {/* Background accent orb */}
        <div
          className="pointer-events-none absolute -bottom-24 -left-24 h-72 w-72 rounded-full opacity-[0.12] blur-[80px]"
          style={{ background: 'var(--accent)' }}
          aria-hidden
        />

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 text-foreground">
          <span className="logo-badge flex h-8 w-8 items-center justify-center rounded-lg text-[13px] font-bold text-black">
            9
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            9ja Checkr
          </span>
        </Link>

        {/* Middle content */}
        <div>
          <p
            className="mb-2 font-mono text-[11px] uppercase tracking-[0.22em]"
            style={{ color: 'var(--accent)' }}
          >
            Developer dashboard
          </p>
          <h2 className="text-[1.9rem] font-bold leading-[1.1] tracking-[-0.035em] text-foreground">
            Build with the NAFDAC API.
          </h2>
          <p
            className="mt-3 text-[14px] leading-relaxed"
            style={{ color: 'var(--text-2)' }}
          >
            Verify NAFDAC registration numbers in your app with a single API
            call. Free tier, no card required.
          </p>

          <ul className="mt-8 space-y-4">
            {[
              {
                icon: ShieldCheck,
                text: '300 free lookups / month to start',
              },
              {
                icon: Code2,
                text: 'Clean REST API · JSON responses',
              },
              {
                icon: Zap,
                text: 'Higher limits on Pro — ₦10k/mo',
              },
            ].map(({ icon: Icon, text }) => (
              <li
                key={text}
                className="flex items-center gap-3 text-[13px]"
                style={{ color: 'var(--text-2)' }}
              >
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border"
                  style={{
                    borderColor: 'var(--border)',
                    background: 'var(--bg-raised)',
                  }}
                >
                  <Icon
                    className="h-3.5 w-3.5"
                    strokeWidth={1.75}
                    style={{ color: 'var(--accent)' }}
                    aria-hidden
                  />
                </div>
                {text}
              </li>
            ))}
          </ul>
        </div>

        {/* Bottom */}
        <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>
          Independent service · not affiliated with NAFDAC ·{' '}
          <Link
            href="/disclaimer"
            className="underline underline-offset-2 transition-colors hover:text-foreground"
          >
            Disclaimer
          </Link>
        </p>
      </div>

      {/* ── Right panel — sign-in form ──────────────────────── */}
      <div className="flex flex-1 flex-col">
        {/* Minimal top bar */}
        <div className="flex items-center justify-between px-6 py-5">
          {/* Mobile logo */}
          <Link
            href="/"
            className="flex items-center gap-2 text-foreground lg:hidden"
          >
            <span className="logo-badge flex h-7 w-7 items-center justify-center rounded-lg text-[12px] font-bold text-black">
              9
            </span>
            <span className="text-[14px] font-semibold">9ja Checkr</span>
          </Link>

          {/* Back link (desktop) + Theme toggle */}
          <Link
            href="/"
            className="hidden items-center gap-1.5 text-[13px] transition-colors hover:text-foreground lg:flex"
            style={{ color: 'var(--text-3)' }}
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back to home
          </Link>

          <div className="flex items-center gap-3 lg:ml-auto">
            <ThemeToggle />
          </div>
        </div>

        {/* Centered form */}
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-[360px]">
            {/* Heading */}
            <div className="mb-8">
              <h1 className="text-[1.75rem] font-bold tracking-[-0.03em] text-foreground">
                Sign in
              </h1>
              <p
                className="mt-2 text-[14px] leading-relaxed"
                style={{ color: 'var(--text-2)' }}
              >
                To access your API keys, usage metrics, and settings.
              </p>
            </div>

            {/* Form card */}
            <div
              className="overflow-hidden rounded-2xl border"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--bg-raised)',
                boxShadow:
                  '0 0 0 4px rgba(223,255,31,0.04), 0 4px 24px -8px rgba(0,0,0,0.4)',
              }}
            >
              {/* Accent top line */}
              <div
                className="h-[2px] w-full"
                style={{
                  background:
                    'linear-gradient(90deg, transparent, var(--accent), transparent)',
                }}
                aria-hidden
              />
              <div className="p-6">
                <Suspense
                  fallback={<div className="skeleton h-12 w-full rounded-xl" />}
                >
                  <LoginForm />
                </Suspense>
              </div>
            </div>

            <p
              className="mt-5 text-center text-[12px] leading-relaxed"
              style={{ color: 'var(--text-3)' }}
            >
              By signing in you agree to use this service responsibly.{' '}
              <Link
                href="/disclaimer"
                className="underline underline-offset-2 transition-colors hover:text-foreground"
              >
                Disclaimer
              </Link>
            </p>

            {/* Mobile only feature bullets */}
            <div
              className="mt-8 rounded-xl border p-4 lg:hidden"
              style={{
                borderColor: 'var(--border-subtle)',
                background: 'var(--bg-subtle)',
              }}
            >
              <p
                className="mb-3 text-[11px] font-semibold uppercase tracking-widest"
                style={{ color: 'var(--text-3)' }}
              >
                What you get
              </p>
              <ul className="space-y-2">
                {[
                  '300 free API lookups / month',
                  'Manage API keys',
                  'Usage metrics & history',
                  'Upgrade to Pro anytime',
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-[13px]"
                    style={{ color: 'var(--text-2)' }}
                  >
                    <span
                      className="h-1.5 w-1.5 shrink-0 rounded-full"
                      style={{ background: 'var(--accent)' }}
                      aria-hidden
                    />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
