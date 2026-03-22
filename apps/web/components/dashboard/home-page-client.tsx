'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { authClient } from '@/lib/auth-client';
import {
  apiBillingQueryKey,
  fetchApiBillingStatus,
} from '@/lib/api-billing-query';
import { ProApiEndpointsDocs } from '@/components/pro-api-endpoints-docs';
import { ApiProUpgradeCta } from '@/components/dashboard/api-pro-upgrade-cta';
import { CurlCard } from './curl-card';

export function HomePageClient({ apiBaseUrl }: { apiBaseUrl: string }) {
  const base = apiBaseUrl.replace(/\/$/, '');
  const { data: session } = authClient.useSession();
  const user = session?.user;

  const billingQuery = useQuery({
    queryKey: apiBillingQueryKey(base),
    queryFn: () => fetchApiBillingStatus(base),
    enabled: Boolean(base),
    staleTime: 60 * 1000,
  });
  const isPro = billingQuery.data?.plan === 'pro_api';

  return (
    <div className="space-y-8">
      <ApiProUpgradeCta apiBaseUrl={apiBaseUrl} variant="banner" />

      <div>
        <h1 className="font-display text-[1.5rem] font-semibold tracking-[-0.03em] text-foreground">
          Overview
        </h1>
        {user?.email ? (
          <p className="mt-1 text-[14px]" style={{ color: 'var(--text-2)' }}>
            Signed in as {user.email}
          </p>
        ) : null}
      </div>

      <div
        className="rounded-xl border p-6"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}
      >
        <h2 className="text-[14px] font-semibold text-foreground">
          Quick start
        </h2>
        <p
          className="mt-1.5 text-[13px] leading-relaxed"
          style={{ color: 'var(--text-2)' }}
        >
          Create an API key, then send a request. The endpoint accepts any valid
          NAFDAC registration number.{' '}
          <Link
            href="/verify"
            className="font-medium text-(--accent) underline underline-offset-3 transition-colors hover:text-(--accent-hover)"
          >
            Or use the public lookup
          </Link>{' '}
          (no API key).
        </p>

        <ol className="mt-5 space-y-3">
          {[
            {
              n: 1,
              text: (
                <>
                  Go to{' '}
                  <Link
                    href="/dashboard/keys"
                    className="font-medium text-(--accent) underline underline-offset-3 transition-colors hover:text-(--accent-hover)"
                  >
                    API Keys
                  </Link>{' '}
                  and create your first key.
                </>
              ),
            },
            {
              n: 2,
              text: "Copy the key, it's shown once when you create or rotate.",
            },
            {
              n: 3,
              text: (
                <>
                  Pass it as the{' '}
                  <code
                    className="font-mono text-[12px]"
                    style={{ color: 'var(--text-2)' }}
                  >
                    x-api-key
                  </code>{' '}
                  header on every request.
                </>
              ),
            },
          ].map(({ n, text }) => (
            <li
              key={n}
              className="flex items-start gap-3 text-[13px]"
              style={{ color: 'var(--text-2)' }}
            >
              <span
                className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full font-mono text-[11px] font-bold"
                style={{
                  background: 'var(--bg-overlay)',
                  color: 'var(--text-3)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {n}
              </span>
              <span className="leading-[1.55]">{text}</span>
            </li>
          ))}
        </ol>

        <Link
          href="/dashboard/keys"
          className="group mt-5 inline-flex items-center gap-1.5 text-[13px] font-medium text-(--accent) transition-colors hover:text-(--accent-hover)"
        >
          Create API key
          <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>

      <div className="space-y-3">
        <h2 className="text-[14px] font-semibold text-foreground">
          Example request
        </h2>
        <CurlCard apiBaseUrl={apiBaseUrl} />
      </div>

      {isPro ? (
        <div className="space-y-4">
          <div>
            <h2 className="text-[14px] font-semibold text-foreground">
              API Pro endpoints
            </h2>
            <p
              className="mt-1 text-[13px] leading-relaxed"
              style={{ color: 'var(--text-2)' }}
            >
              Batch verify and product search are included with your API Pro
              plan. Same{' '}
              <code
                className="font-mono text-[12px]"
                style={{ color: 'var(--text-3)' }}
              >
                x-api-key
              </code>{' '}
              header; batch requests count each NAFDAC toward your monthly
              quota.
            </p>
          </div>
          <ProApiEndpointsDocs apiBaseUrl={apiBaseUrl} />
        </div>
      ) : null}
    </div>
  );
}
