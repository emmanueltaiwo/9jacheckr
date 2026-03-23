'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export function LandingFooterCta() {
  const { data: session } = authClient.useSession();
  const signedIn = Boolean(session?.user);

  return (
    <Link
      href={signedIn ? '/dashboard' : '/login?next=/dashboard'}
      className="group inline-flex h-12 shrink-0 items-center justify-center gap-2 rounded-full bg-(--accent) px-8 text-[13px] font-bold uppercase tracking-[0.08em] text-black transition-opacity hover:opacity-95 focus-visible-ring"
    >
      {signedIn ? 'Dashboard' : 'Create account'}
      <ArrowRight
        className="h-4 w-4 transition-transform group-hover:translate-x-0.5"
        aria-hidden
      />
    </Link>
  );
}
