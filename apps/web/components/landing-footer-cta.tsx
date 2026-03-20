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
      className="group btn-primary h-[42px] px-6 text-[14px] focus-visible-ring"
    >
      {signedIn ? 'Open dashboard' : 'Create free account'}
      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </Link>
  );
}
