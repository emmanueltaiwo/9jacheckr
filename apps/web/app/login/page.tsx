import { Suspense } from 'react';
import { SiteNav } from '@/components/site-nav';
import { LoginForm } from '@/components/login/login-form';

export default function LoginPage() {
  return (
    <div className="page-bg flex min-h-dvh flex-col text-[var(--text)]">
      <SiteNav />

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-[360px]">
          <div className="mb-8">
            <h1 className="font-display text-[1.6rem] font-semibold tracking-[-0.03em]">
              Sign in to 9ja Checkr
            </h1>
            <p
              className="mt-2 text-[14px] leading-relaxed"
              style={{ color: 'var(--text-2)' }}
            >
              Create and manage your API keys to start verifying NAFDAC product
              registrations.
            </p>
          </div>

          <div
            className="rounded-xl border p-6"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--bg-subtle)',
            }}
          >
            <Suspense fallback={<div className="skeleton h-10 w-full" />}>
              <LoginForm />
            </Suspense>
          </div>

          <p
            className="mt-5 text-center text-[12px]"
            style={{ color: 'var(--text-3)' }}
          >
            By continuing, you agree to use this service responsibly.
          </p>
        </div>
      </main>
    </div>
  );
}
