'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { authClient, getApiBaseUrl } from '@/lib/auth-client';

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextRaw = searchParams.get('next') ?? '/dashboard';
  const nextPath = nextRaw.startsWith('/') ? nextRaw : '/dashboard';

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const apiBase = getApiBaseUrl();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (isPending || !session?.user) return;
    router.replace(nextPath);
  }, [session, isPending, router, nextPath]);

  async function signInWithGoogle() {
    if (!apiBase) {
      setError('NEXT_PUBLIC_API_BASE_URL is not set in .env.local');
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const callbackURL = `${window.location.origin}${nextPath}`;
      await authClient.signIn.social({ provider: 'google', callbackURL });
      router.replace(nextPath);
      router.refresh();
    } catch (e) {
      setError(
        e instanceof Error ? e.message : 'Sign-in failed. Please try again.',
      );
      setBusy(false);
    }
  }

  if (!apiBase) {
    return (
      <div
        className="rounded-lg border px-4 py-3 text-[13px]"
        style={{
          borderColor: 'rgba(251,191,36,0.25)',
          background: 'rgba(251,191,36,0.07)',
          color: 'rgb(253,230,138)',
        }}
      >
        Set{' '}
        <code className="font-mono text-amber-300">
          NEXT_PUBLIC_API_BASE_URL
        </code>{' '}
        in <code className="font-mono text-amber-300">.env.local</code> — e.g.{' '}
        <code className="font-mono text-amber-300">http://localhost:4000</code>.
      </div>
    );
  }

  if (isPending || session?.user) {
    return <div className="skeleton h-10 w-full" aria-busy />;
  }

  return (
    <div className="space-y-4">
      {error ? (
        <div
          className="flex items-start gap-2 rounded-lg border px-3 py-3 text-[13px]"
          style={{
            borderColor: 'rgba(239,68,68,0.25)',
            background: 'rgba(239,68,68,0.07)',
            color: 'rgb(252,165,165)',
          }}
          role="alert"
        >
          {error}
        </div>
      ) : null}

      <button
        type="button"
        disabled={busy}
        onClick={() => void signInWithGoogle()}
        className="flex w-full items-center justify-center gap-3 rounded-lg border bg-white px-4 py-2.5 text-[14px] font-semibold text-zinc-900 transition hover:bg-zinc-50 disabled:cursor-not-allowed disabled:opacity-50 focus-visible-ring"
        style={{ borderColor: 'rgba(0,0,0,0.1)' }}
      >
        <GoogleIcon />
        {busy ? 'Redirecting…' : 'Continue with Google'}
      </button>

      <p className="text-center text-[12px]" style={{ color: 'var(--text-3)' }}>
        <Link href="/" className="transition-colors hover:text-[var(--text-2)]">
          ← Back to home
        </Link>
      </p>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg className="h-[18px] w-[18px] shrink-0" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  );
}
