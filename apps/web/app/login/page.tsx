'use client';

import { authClient } from '@/lib/auth-client';
import { SiteNav } from '@/components/site-nav';

export default function LoginPage() {
  return (
    <div className="bg-app relative min-h-dvh">
      <div
        className="bg-grid pointer-events-none absolute inset-0"
        aria-hidden
      />
      <SiteNav variant="minimal" authFlow />

      <div className="relative flex min-h-[calc(100dvh-3.5rem)] flex-col items-center justify-center px-4 py-16">
        <div className="panel panel-glow relative w-full max-w-[420px] overflow-hidden rounded-2xl border border-white/10 bg-[#080807]/90 p-8 shadow-2xl backdrop-blur-xl sm:p-10">
          <div className="pointer-events-none absolute -right-20 -top-20 h-52 w-52 rounded-full bg-[#dfff1f]/08 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-16 -left-16 h-44 w-44 rounded-full bg-stone-500/10 blur-3xl" />

          <div className="relative">
            <h1 className="font-display text-2xl font-semibold tracking-tight text-[#eceae1] sm:text-3xl">
              Sign in
            </h1>
            <p className="mt-2 text-sm text-stone-500">
              Use Google to get your API key and open the dashboard.
            </p>

            <button
              type="button"
              className="group mt-8 flex w-full items-center justify-center gap-3 rounded-xl border border-white/15 bg-white/[0.03] px-4 py-3.5 text-sm font-semibold text-[#eceae1] transition hover:border-white/25 hover:bg-white/[0.06]"
              onClick={() => {
                const callbackURL = `${window.location.origin}/dashboard`;
                authClient.signIn.social({
                  provider: 'google',
                  callbackURL,
                });
              }}
            >
              <svg className="h-5 w-5 shrink-0" viewBox="0 0 24 24" aria-hidden>
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  className="text-zinc-200"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  className="text-emerald-400/90"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  className="text-amber-400/90"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  className="text-red-400/90"
                />
              </svg>
              Continue with Google
            </button>

            <p className="mt-6 text-center text-xs text-stone-600">
              We use cookies to keep you signed in.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
