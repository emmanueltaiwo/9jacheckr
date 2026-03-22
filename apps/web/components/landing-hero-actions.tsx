'use client';

import Link from 'next/link';
import { ArrowRight, Heart, Mail } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { SUPPORT_MAILTO } from '@/lib/support';

type LandingHeroActionsProps = {
  supportHref?: string;
};

export function LandingHeroActions({ supportHref }: LandingHeroActionsProps) {
  const { data: session, isPending } = authClient.useSession();
  const signedIn = Boolean(session?.user);

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:gap-3">
      <Link
        href={signedIn ? '/dashboard' : '/login?next=/dashboard'}
        className="group btn-primary inline-flex h-[42px] w-full shrink-0 items-center justify-center gap-2 px-5 text-[14px] focus-visible-ring sm:w-auto"
      >
        {isPending
          ? 'Loading…'
          : signedIn
            ? 'Open dashboard'
            : 'Get your API key'}
        <ArrowRight
          className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-0.5"
          aria-hidden
        />
      </Link>
      {supportHref ? (
        <a
          href={supportHref}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex h-[42px] w-full shrink-0 items-center justify-center gap-2 rounded-lg border border-(--btn-accent-outline-border) bg-(--btn-accent-outline-bg) px-5 text-[14px] font-semibold text-(--btn-accent-outline-fg) transition-colors hover:border-(--btn-accent-outline-hover-border) hover:bg-(--btn-accent-outline-hover-bg) hover:text-(--btn-accent-outline-hover-fg) focus-visible-ring sm:w-auto"
        >
          <Heart className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          Support the project
        </a>
      ) : null}
      <a
        href={SUPPORT_MAILTO}
        className="btn-secondary inline-flex h-[42px] w-full shrink-0 items-center justify-center gap-2 px-5 text-[14px] no-underline focus-visible-ring sm:w-auto"
      >
        <Mail className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
        Email support
      </a>
    </div>
  );
}
