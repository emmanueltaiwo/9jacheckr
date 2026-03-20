'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

export function LandingHeroActions() {
  const { data: session, isPending } = authClient.useSession();
  const signedIn = Boolean(session?.user);

  return (
    <div className="flex flex-wrap items-center gap-3">
      <Link
        href={signedIn ? '/dashboard' : '/login?next=/dashboard'}
        className="group btn-primary h-[42px] px-5 text-[14px] focus-visible-ring"
      >
        {isPending
          ? 'Loading…'
          : signedIn
            ? 'Open dashboard'
            : 'Get your API key'}
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
      <a
        href="#api"
        className="btn-secondary h-[42px] px-5 text-[14px] focus-visible-ring"
      >
        View API reference
      </a>
    </div>
  );
}
