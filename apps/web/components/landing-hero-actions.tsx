'use client';

import Link from 'next/link';
import { ArrowRight, Heart, Mail } from 'lucide-react';
import { authClient } from '@/lib/auth-client';
import { SUPPORT_MAILTO } from '@/lib/support';
import { cn } from '@/lib/utils';

type LandingHeroActionsProps = {
  supportHref?: string;
  className?: string;
};

export function LandingHeroActions({
  supportHref,
  className,
}: LandingHeroActionsProps) {
  const { data: session, isPending } = authClient.useSession();
  const signedIn = Boolean(session?.user);

  const pill =
    'inline-flex h-11 items-center justify-center gap-2 rounded-full border px-5 text-[13px] font-semibold transition-colors focus-visible-ring';

  return (
    <div
      className={cn(
        'flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center',
        className,
      )}
    >
      <Link
        href={signedIn ? '/dashboard' : '/login?next=/dashboard'}
        className="group btn-primary inline-flex h-11 items-center justify-center gap-2 rounded-full px-6 text-[13px] font-semibold focus-visible-ring"
      >
        {isPending ? 'Loading…' : signedIn ? 'Dashboard' : 'API access'}
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
          className={cn(
            pill,
            'border-(--btn-accent-outline-border) bg-(--btn-accent-outline-bg) text-(--btn-accent-outline-fg) hover:border-(--btn-accent-outline-hover-border) hover:bg-(--btn-accent-outline-hover-bg) hover:text-(--btn-accent-outline-hover-fg)',
          )}
        >
          <Heart className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
          Support us
        </a>
      ) : null}
      <a
        href={SUPPORT_MAILTO}
        className={cn(
          pill,
          'border-(--border) bg-transparent text-(--text-2) no-underline hover:border-(--card-hover-border) hover:bg-(--nav-hover-bg) hover:text-foreground',
        )}
      >
        <Mail className="h-4 w-4 shrink-0" strokeWidth={2} aria-hidden />
        Email
      </a>
    </div>
  );
}
