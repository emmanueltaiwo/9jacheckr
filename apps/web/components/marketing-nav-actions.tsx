'use client';

import Link from 'next/link';
import { authClient } from '@/lib/auth-client';

export function MarketingNavActions() {
  const { data: session, isPending } = authClient.useSession();
  const signedIn = Boolean(session?.user);

  if (isPending) {
    return (
      <div className="flex items-center gap-2">
        <div className="h-8 w-12 animate-pulse rounded-md skeleton" />
        <div className="h-8 w-24 animate-pulse rounded-md skeleton" />
      </div>
    );
  }

  if (signedIn) {
    return (
      <Link
        href="/dashboard"
        className="btn-primary h-8 text-[13px] focus-visible-ring"
      >
        Dashboard
      </Link>
    );
  }

  return (
    <>
      <Link
        href="/login"
        className="btn-ghost h-8 hidden sm:inline-flex focus-visible-ring"
      >
        Log in
      </Link>
      <Link
        href="/login?next=/dashboard"
        className="btn-primary focus-visible-ring"
      >
        Get started
      </Link>
    </>
  );
}
