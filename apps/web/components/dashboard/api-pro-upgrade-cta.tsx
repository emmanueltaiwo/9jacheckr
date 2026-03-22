'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { Loader2, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  apiBillingQueryKey,
  fetchApiBillingStatus,
} from '@/lib/api-billing-query';

type Variant = 'banner' | 'sidebar' | 'navbar';

type Props = {
  apiBaseUrl: string;
  variant?: Variant;
};

export function ApiProUpgradeCta({ apiBaseUrl, variant = 'banner' }: Props) {
  const base = apiBaseUrl.replace(/\/$/, '');
  const queryClient = useQueryClient();

  const billingQuery = useQuery({
    queryKey: apiBillingQueryKey(base),
    queryFn: () => fetchApiBillingStatus(base),
    enabled: Boolean(base),
    staleTime: 60 * 1000,
  });

  const upgradeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${base}/api/keys/billing/initialize-pro`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      const data = (await res.json()) as {
        ok?: boolean;
        authorizationUrl?: string;
        message?: string;
      };
      if (!res.ok || !data.ok || !data.authorizationUrl) {
        throw new Error(data.message ?? 'Could not start checkout.');
      }
      return data.authorizationUrl;
    },
    onSuccess: (url) => {
      void queryClient.invalidateQueries({
        queryKey: apiBillingQueryKey(base),
      });
      window.location.assign(url);
    },
  });

  if (!base) return null;
  if (billingQuery.isPending && variant === 'navbar') return null;
  if (billingQuery.isPending && variant !== 'navbar') {
    return (
      <div
        className={cn(
          'animate-pulse rounded-xl border',
          variant === 'sidebar' && 'h-24',
          variant === 'banner' && 'h-20',
        )}
        style={{
          borderColor: 'var(--border-subtle)',
          background: 'var(--bg-subtle)',
        }}
        aria-hidden
      />
    );
  }
  if (billingQuery.isError || !billingQuery.data) return null;
  if (billingQuery.data.plan === 'pro_api') return null;

  const busy = upgradeMutation.isPending;
  const err = upgradeMutation.error?.message;

  if (variant === 'navbar') {
    return (
      <div className="flex flex-col items-end gap-1">
        <button
          type="button"
          disabled={busy}
          onClick={() => upgradeMutation.mutate()}
          className="inline-flex h-8 items-center gap-1.5 rounded-full border px-3 text-[12px] font-semibold transition-colors disabled:opacity-50 focus-visible-ring"
          style={{
            borderColor: 'var(--accent)',
            color: 'var(--accent)',
            background: 'var(--bg-raised)',
          }}
        >
          {busy ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
          ) : (
            <Sparkles className="h-3.5 w-3.5" strokeWidth={2} aria-hidden />
          )}
          Upgrade
        </button>
        {err ? (
          <p className="max-w-[200px] text-right text-[10px] text-(--callout-warning-fg)">
            {err}
          </p>
        ) : null}
      </div>
    );
  }

  if (variant === 'sidebar') {
    return (
      <div
        className="rounded-xl border p-3"
        style={{
          borderColor: 'var(--accent)',
          background:
            'linear-gradient(145deg, var(--bg-subtle) 0%, var(--bg-raised) 100%)',
        }}
      >
        <div className="flex items-start gap-2">
          <span
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
            style={{
              background: 'var(--bg-overlay)',
              color: 'var(--accent)',
            }}
          >
            <Sparkles className="h-4 w-4" strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-[12px] font-semibold text-foreground">
              API Pro
            </p>
            <p className="mt-0.5 text-[11px] leading-snug text-(--text-3)">
              Higher limits, metrics, batch &amp; search. Upgrade anytime.
            </p>
            <button
              type="button"
              disabled={busy}
              onClick={() => upgradeMutation.mutate()}
              className="btn-primary mt-2.5 h-8 w-full text-[12px] disabled:opacity-50 focus-visible-ring"
            >
              {busy ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
              ) : (
                'Upgrade — ₦10k/mo'
              )}
            </button>
            <Link
              href="/#pricing"
              className="mt-2 block text-center text-[11px] font-medium text-(--accent) underline-offset-2 hover:underline"
            >
              View all plans
            </Link>
          </div>
        </div>
        {err ? (
          <p
            className="mt-2 text-[11px]"
            style={{ color: 'var(--callout-warning-fg)' }}
          >
            {err}
          </p>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className="relative overflow-hidden rounded-xl border p-5 sm:p-6"
      style={{
        borderColor: 'var(--accent)',
        background: 'var(--bg-subtle)',
      }}
    >
      <div
        className="pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-40 blur-2xl"
        style={{ background: 'var(--accent)' }}
        aria-hidden
      />
      <div className="relative flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          <span
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--bg-raised)',
              color: 'var(--accent)',
            }}
          >
            <Sparkles className="h-5 w-5" strokeWidth={2} aria-hidden />
          </span>
          <div className="min-w-0">
            <p className="text-[14px] font-semibold text-foreground">
              You&apos;re on the Free API plan
            </p>
            <p
              className="mt-1 max-w-xl text-[13px] leading-relaxed"
              style={{ color: 'var(--text-2)' }}
            >
              Unlock 30k checks/month, dashboard metrics, multiple keys, batch
              verify, and product search. Subscribe when you need it — manage
              billing from{' '}
              <Link
                href="/dashboard/keys"
                className="font-medium text-(--accent) underline underline-offset-2 hover:text-(--accent-hover)"
              >
                API Keys
              </Link>
              .
            </p>
            {err ? (
              <p
                className="mt-2 text-[12px]"
                style={{ color: 'var(--callout-warning-fg)' }}
              >
                {err}
              </p>
            ) : null}
          </div>
        </div>
        <div className="flex shrink-0 flex-col gap-2 sm:items-end">
          <button
            type="button"
            disabled={busy}
            onClick={() => upgradeMutation.mutate()}
            className="btn-primary h-10 px-5 text-[13px] whitespace-nowrap disabled:opacity-50 focus-visible-ring"
          >
            {busy ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
                Redirecting…
              </>
            ) : (
              'Upgrade to API Pro'
            )}
          </button>
          <Link
            href="/#pricing"
            className="text-center text-[12px] font-medium text-(--accent) underline-offset-2 hover:underline sm:text-right"
          >
            Compare plans
          </Link>
        </div>
      </div>
    </div>
  );
}
