'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { authClient, getApiBaseUrl } from '@/lib/auth-client';

export function DashboardAuthGate({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const apiBase = getApiBaseUrl();
  const { data: session, isPending } = authClient.useSession();

  useEffect(() => {
    if (!apiBase || isPending) return;
    if (!session?.user) {
      router.replace('/login?next=/dashboard');
    }
  }, [apiBase, session, isPending, router]);

  if (!apiBase) {
    return (
      <div className="flex min-h-dvh items-center justify-center p-6 page-bg">
        <div
          className="max-w-sm rounded-xl border p-6 text-[14px]"
          style={{
            borderColor: 'var(--callout-warning-border)',
            background: 'var(--callout-warning-bg)',
            color: 'var(--callout-warning-fg)',
          }}
        >
          <p className="font-semibold">Environment not configured</p>
          <p
            className="mt-2 text-[13px] leading-relaxed"
            style={{ color: 'var(--callout-warning-muted)' }}
          >
            Set{' '}
            <code
              className="font-mono"
              style={{ color: 'var(--callout-warning-fg)' }}
            >
              NEXT_PUBLIC_API_BASE_URL
            </code>{' '}
            in{' '}
            <code
              className="font-mono"
              style={{ color: 'var(--callout-warning-fg)' }}
            >
              apps/web/.env.local
            </code>{' '}
            to your API origin - e.g.{' '}
            <code
              className="font-mono"
              style={{ color: 'var(--callout-warning-fg)' }}
            >
              http://localhost:4000
            </code>
            .
          </p>
        </div>
      </div>
    );
  }

  if (isPending || !session?.user) {
    return (
      <div className="flex min-h-dvh items-center justify-center page-bg">
        <div className="space-y-4 w-full max-w-3xl px-6">
          <div className="skeleton h-7 w-40 rounded-md" />
          <div className="skeleton h-40 w-full rounded-xl" />
          <div className="skeleton h-28 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
