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
            borderColor: 'rgba(251,191,36,0.25)',
            background: 'rgba(251,191,36,0.06)',
            color: 'rgb(253,230,138)',
          }}
        >
          <p className="font-semibold">Environment not configured</p>
          <p
            className="mt-2 text-[13px] leading-relaxed"
            style={{ color: 'rgb(253,230,138,0.8)' }}
          >
            Set{' '}
            <code className="font-mono text-amber-300">
              NEXT_PUBLIC_API_BASE_URL
            </code>{' '}
            in{' '}
            <code className="font-mono text-amber-300">
              apps/web/.env.local
            </code>{' '}
            to your API origin — e.g.{' '}
            <code className="font-mono text-amber-300">
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
