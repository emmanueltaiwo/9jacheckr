'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useState } from 'react';
import {
  AlertCircle,
  CreditCard,
  Pencil,
  Plus,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { clsx } from 'clsx';
import { CopyFieldButton } from './copy-field-button';
import {
  apiBillingQueryKey,
  fetchApiBillingStatus,
} from '@/lib/api-billing-query';

type ApiKeyRow = {
  id: string;
  keyPrefix: string;
  label: string;
  isPrimary?: boolean;
  lastUsedAt: string | null;
  createdAt: string;
};

type MeJson = { ok: boolean; apiKey: ApiKeyRow | null; keys: ApiKeyRow[] };
type CreateJson = {
  ok: boolean;
  rawKey: string;
  apiKey: ApiKeyRow;
  keys: ApiKeyRow[];
};

type PatchLabelJson = {
  ok: boolean;
  apiKey: ApiKeyRow | null;
  keys: ApiKeyRow[];
};
type RevokeJson = { ok: boolean; revokedAt: string | null };

type UsageMetrics = {
  totalVerifications: number;
  foundCount: number;
  notFoundCount: number;
  errorCount: number;
  lastVerifyAt: string | null;
};

type MetricsJson = { ok: boolean; metrics?: UsageMetrics; code?: string };

type MetricsFetchResult =
  | { kind: 'ok'; metrics: UsageMetrics }
  | { kind: 'locked' }
  | { kind: 'error'; message: string };

async function fetchApiKeyMe(base: string): Promise<{
  apiKey: ApiKeyRow | null;
  keys: ApiKeyRow[];
}> {
  const res = await fetch(`${base}/api/keys/me`, { credentials: 'include' });
  const data = (await res.json()) as MeJson;
  if (!res.ok || !data.ok) {
    throw new Error('Could not load key status.');
  }
  return { apiKey: data.apiKey, keys: data.keys ?? [] };
}

async function fetchApiKeyMetrics(base: string): Promise<MetricsFetchResult> {
  const res = await fetch(`${base}/api/keys/metrics`, {
    credentials: 'include',
  });
  const data = (await res.json()) as MetricsJson;
  if (res.status === 403 && data?.code === 'METRICS_NOT_AVAILABLE') {
    return { kind: 'locked' };
  }
  if (!res.ok || !data.ok || !data.metrics) {
    return {
      kind: 'error',
      message:
        typeof data === 'object' && data && 'message' in data
          ? String((data as { message?: string }).message)
          : 'Could not load usage metrics.',
    };
  }
  return { kind: 'ok', metrics: data.metrics };
}

export function ApiKeySection({ apiBaseUrl }: { apiBaseUrl: string }) {
  const base = apiBaseUrl.replace(/\/$/, '');
  const queryClient = useQueryClient();
  const [rawKey, setRawKey] = useState<string | null>(null);
  const [editingKeyId, setEditingKeyId] = useState<string | null>(null);
  const [labelDraft, setLabelDraft] = useState('');

  const keyQuery = useQuery({
    queryKey: ['api-keys', 'me', base],
    queryFn: () => fetchApiKeyMe(base),
    enabled: Boolean(base),
    staleTime: 60 * 1000,
  });

  const billingQuery = useQuery({
    queryKey: apiBillingQueryKey(base),
    queryFn: () => fetchApiBillingStatus(base),
    enabled: Boolean(base),
    staleTime: 60 * 1000,
  });

  const metricsQuery = useQuery({
    queryKey: ['api-keys', 'metrics', base],
    queryFn: () => fetchApiKeyMetrics(base),
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
      window.location.assign(url);
    },
  });

  const createMutation = useMutation({
    mutationFn: async (body: {
      additional?: boolean;
      rotateKeyId?: string;
      label?: string;
    }) => {
      const res = await fetch(`${base}/api/keys/create`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = (await res.json()) as CreateJson & {
        code?: string;
        message?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.message ?? 'Could not create or rotate key.');
      }
      return data;
    },
    onMutate: () => {
      setRawKey(null);
    },
    onSuccess: (data) => {
      setRawKey(data.rawKey);
      queryClient.setQueryData(['api-keys', 'me', base], {
        apiKey: data.apiKey,
        keys: data.keys,
      });
      void queryClient.invalidateQueries({
        queryKey: ['api-keys', 'metrics', base],
      });
      void queryClient.invalidateQueries({
        queryKey: apiBillingQueryKey(base),
      });
    },
  });

  const revokeMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${base}/api/keys/me`, {
        method: 'DELETE',
        credentials: 'include',
      });
      if (res.status === 404) {
        return { ok: false as const };
      }
      const data = (await res.json()) as RevokeJson;
      if (!res.ok) {
        throw new Error('Could not revoke keys.');
      }
      return data;
    },
    onMutate: () => {
      setRawKey(null);
    },
    onSuccess: () => {
      queryClient.setQueryData(['api-keys', 'me', base], {
        apiKey: null,
        keys: [],
      });
      void queryClient.invalidateQueries({
        queryKey: ['api-keys', 'metrics', base],
      });
      void queryClient.invalidateQueries({
        queryKey: apiBillingQueryKey(base),
      });
    },
  });

  const labelMutation = useMutation({
    mutationFn: async ({ keyId, label }: { keyId: string; label: string }) => {
      const res = await fetch(
        `${base}/api/keys/key/${encodeURIComponent(keyId)}/label`,
        {
          method: 'PATCH',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ label }),
        },
      );
      const data = (await res.json()) as PatchLabelJson & {
        code?: string;
        message?: string;
      };
      if (!res.ok || !data.ok) {
        throw new Error(data.message ?? 'Could not update label.');
      }
      return data;
    },
    onSuccess: (data) => {
      setEditingKeyId(null);
      queryClient.setQueryData(['api-keys', 'me', base], {
        apiKey: data.apiKey ?? data.keys[0] ?? null,
        keys: data.keys,
      });
    },
  });

  const revokeOneMutation = useMutation({
    mutationFn: async (keyId: string) => {
      const res = await fetch(`${base}/api/keys/key/${encodeURIComponent(keyId)}`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.message ?? 'Could not revoke key.');
      }
    },
    onSuccess: () => {
      setRawKey(null);
      void keyQuery.refetch();
      void queryClient.invalidateQueries({
        queryKey: ['api-keys', 'metrics', base],
      });
      void queryClient.invalidateQueries({
        queryKey: apiBillingQueryKey(base),
      });
    },
  });

  const busy =
    createMutation.isPending ||
    revokeMutation.isPending ||
    revokeOneMutation.isPending ||
    upgradeMutation.isPending ||
    labelMutation.isPending;
  const keys = keyQuery.data?.keys ?? [];
  const billing = billingQuery.data;
  const isPro = billing?.plan === 'pro_api';
  const metricsResult = metricsQuery.data;
  const mutationError =
    createMutation.error?.message ??
    revokeMutation.error?.message ??
    revokeOneMutation.error?.message ??
    upgradeMutation.error?.message ??
    labelMutation.error?.message ??
    null;
  const msg = mutationError;

  if (!base) {
    return (
      <div
        className="rounded-xl border px-4 py-3 text-[13px]"
        style={{
          borderColor: 'var(--callout-warning-border)',
          background: 'var(--callout-warning-bg)',
          color: 'var(--callout-warning-fg)',
        }}
      >
        Set{' '}
        <span
          className="font-mono"
          style={{ color: 'var(--callout-warning-fg)' }}
        >
          NEXT_PUBLIC_API_BASE_URL
        </span>{' '}
        in <span className="font-mono">.env.local</span>.
      </div>
    );
  }

  if (keyQuery.isPending) {
    return (
      <div className="space-y-4">
        <div
          className="rounded-xl border p-5"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--bg-subtle)',
          }}
        >
          <div className="skeleton mb-4 h-4 w-32 rounded" />
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-14 rounded-lg" />
            ))}
          </div>
        </div>
        <div
          className="rounded-xl border"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--bg-subtle)',
          }}
        >
          <div
            className="flex items-center justify-between border-b p-5"
            style={{ borderColor: 'var(--border-subtle)' }}
          >
            <div className="skeleton h-4 w-24 rounded" />
            <div className="skeleton h-8 w-24 rounded-lg" />
          </div>
          <div className="p-5">
            <div className="skeleton h-20 w-full rounded-lg" />
          </div>
        </div>
      </div>
    );
  }

  if (keyQuery.isError) {
    return (
      <div
        className="flex flex-col items-start gap-3 rounded-xl border px-4 py-4 text-[13px]"
        style={{
          borderColor: 'var(--callout-warning-border)',
          background: 'var(--callout-warning-bg)',
          color: 'var(--callout-warning-fg)',
        }}
      >
        <div className="flex items-start gap-2">
          <AlertCircle
            className="mt-0.5 h-4 w-4 shrink-0"
            style={{ color: 'var(--callout-warning-icon)' }}
          />
          {keyQuery.error instanceof Error
            ? keyQuery.error.message
            : 'Could not load key status.'}
        </div>
        <button
          type="button"
          onClick={() => void keyQuery.refetch()}
          className="rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors hover:bg-(--callout-warning-btn-hover-bg) focus-visible-ring"
          style={{
            borderColor: 'var(--callout-warning-btn-border)',
            color: 'var(--callout-warning-btn-fg)',
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  return (
    <div className="space-y-4">
      {billingQuery.isSuccess && billing ? (
        <div
          className="rounded-xl border px-5 py-4"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--bg-subtle)',
          }}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-[14px] font-semibold text-foreground">
                Plan &amp; monthly quota
              </h3>
              <p
                className="mt-0.5 text-[12px]"
                style={{ color: 'var(--text-3)' }}
              >
                {isPro ? (
                  <>
                    <span className="font-medium text-foreground">API Pro</span>
                    {' — '}
                    successful verifies this month count toward your cap.
                  </>
                ) : (
                  <>
                    <span className="font-medium text-foreground">Free</span>
                    {' — '}
                    upgrade for higher limits, metrics, and multiple keys.
                  </>
                )}
              </p>
              <p
                className="mt-2 font-display text-[1.25rem] font-semibold tabular-nums tracking-tight text-foreground"
              >
                {billing.monthlyUsed.toLocaleString()}
                <span style={{ color: 'var(--text-3)' }}>
                  {' '}
                  / {billing.monthlyLimit.toLocaleString()}
                </span>
              </p>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => void billingQuery.refetch()}
                disabled={billingQuery.isFetching}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-(--border) px-3 text-[12px] font-medium text-(--text-2) transition-colors hover:bg-(--bg-raised) disabled:opacity-50 focus-visible-ring"
                aria-label="Refresh plan and quota"
              >
                <RefreshCw
                  className={clsx(
                    'h-3.5 w-3.5',
                    billingQuery.isFetching && 'animate-spin',
                  )}
                  aria-hidden
                />
                Refresh
              </button>
              {!isPro ? (
                <button
                  type="button"
                  disabled={upgradeMutation.isPending}
                  onClick={() => upgradeMutation.mutate()}
                  className="inline-flex h-9 items-center gap-2 rounded-md border border-(--border) px-3 text-[12px] font-medium text-(--text-2) transition-colors hover:bg-(--bg-raised) disabled:opacity-50 focus-visible-ring"
                >
                  <CreditCard className="h-3.5 w-3.5" aria-hidden />
                  Upgrade to Pro
                </button>
              ) : null}
            </div>
          </div>
          <p className="mt-3 border-t border-(--border-subtle) pt-3 text-[12px] text-(--text-3)">
            <Link
              href="/dashboard/settings"
              className="font-medium text-(--accent) underline-offset-2 hover:underline"
            >
              Billing &amp; payments
            </Link>
            {' — '}cancel subscription, update card, history.
          </p>
        </div>
      ) : billingQuery.isError ? (
        <div
          className="rounded-xl border px-5 py-4 text-[13px]"
          style={{
            borderColor: 'var(--callout-warning-border)',
            background: 'var(--callout-warning-bg)',
            color: 'var(--callout-warning-fg)',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span>
              {billingQuery.error instanceof Error
                ? billingQuery.error.message
                : 'Could not load billing.'}
            </span>
            <button
              type="button"
              onClick={() => void billingQuery.refetch()}
              disabled={billingQuery.isFetching}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-3 text-[12px] font-medium transition-colors disabled:opacity-50 focus-visible-ring"
              style={{
                borderColor: 'var(--callout-warning-btn-border)',
                color: 'var(--callout-warning-btn-fg)',
              }}
            >
              <RefreshCw
                className={clsx(
                  'h-3.5 w-3.5',
                  billingQuery.isFetching && 'animate-spin',
                )}
                aria-hidden
              />
              Retry
            </button>
          </div>
        </div>
      ) : null}

      {metricsResult?.kind === 'ok' ? (
        <div
          className="rounded-xl border px-5 py-4"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--bg-subtle)',
          }}
        >
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="text-[14px] font-semibold text-foreground">
                Verify usage
              </h3>
              <p
                className="mt-0.5 text-[12px]"
                style={{ color: 'var(--text-3)' }}
              >
                Counts for{' '}
                <code className="font-mono text-[11px] text-(--text-3)">
                  GET /api/verify/:nafdac
                </code>{' '}
                with your API key.
              </p>
            </div>
            <button
              type="button"
              onClick={() => void metricsQuery.refetch()}
              disabled={metricsQuery.isFetching}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-3 text-[12px] font-medium transition-colors disabled:opacity-50 focus-visible-ring"
              style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
              aria-label="Refresh usage metrics"
            >
              <RefreshCw
                className={clsx(
                  'h-3.5 w-3.5',
                  metricsQuery.isFetching && 'animate-spin',
                )}
                aria-hidden
              />
              Refresh
            </button>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <StatBox
              label="Total"
              value={metricsResult.metrics.totalVerifications}
              accent="var(--text)"
            />
            <StatBox
              label="Found"
              value={metricsResult.metrics.foundCount}
              accent="var(--stat-found)"
            />
            <StatBox
              label="Not found"
              value={metricsResult.metrics.notFoundCount}
              accent="var(--stat-not-found)"
            />
            <StatBox
              label="Errors"
              value={metricsResult.metrics.errorCount}
              accent="var(--stat-errors)"
            />
          </div>
          <p className="mt-3 text-[12px]" style={{ color: 'var(--text-3)' }}>
            {metricsResult.metrics.lastVerifyAt
              ? `Last verify ${fmtDate(metricsResult.metrics.lastVerifyAt)}`
              : 'No verify requests yet'}
          </p>
        </div>
      ) : metricsResult?.kind === 'locked' ? (
        <div
          className="rounded-xl border px-5 py-4"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--bg-subtle)',
          }}
        >
          <h3 className="text-[14px] font-semibold text-foreground">
            Detailed metrics
          </h3>
          <p className="mt-1 text-[13px]" style={{ color: 'var(--text-3)' }}>
            Dashboard breakdowns are included with API Pro. Your monthly verify
            count still appears under plan &amp; quota above.
          </p>
          {billingQuery.isSuccess && !isPro ? (
            <button
              type="button"
              disabled={upgradeMutation.isPending}
              onClick={() => upgradeMutation.mutate()}
              className="btn-primary mt-3 h-8 text-[13px] disabled:opacity-50 focus-visible-ring"
            >
              Upgrade to Pro
            </button>
          ) : null}
        </div>
      ) : metricsResult?.kind === 'error' ? (
        <div
          className="rounded-xl border px-5 py-4"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--bg-subtle)',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div
              className="flex min-w-0 items-start gap-2 text-[13px]"
              style={{ color: 'var(--callout-warning-fg)' }}
            >
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0"
                style={{ color: 'var(--callout-warning-icon)' }}
              />
              <span>{metricsResult.message}</span>
            </div>
            <button
              type="button"
              onClick={() => void metricsQuery.refetch()}
              disabled={metricsQuery.isFetching}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border px-3 text-[12px] font-medium transition-colors hover:bg-(--callout-warning-btn-hover-bg) disabled:opacity-50 focus-visible-ring"
              style={{
                borderColor: 'var(--callout-warning-btn-border)',
                color: 'var(--callout-warning-btn-fg)',
              }}
              aria-label="Retry loading usage metrics"
            >
              <RefreshCw
                className={clsx(
                  'h-3.5 w-3.5',
                  metricsQuery.isFetching && 'animate-spin',
                )}
                aria-hidden
              />
              Retry
            </button>
          </div>
        </div>
      ) : metricsQuery.isPending ? (
        <div
          className="rounded-xl border p-5"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--bg-subtle)',
          }}
        >
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="skeleton h-4 w-32 rounded" />
            <div className="skeleton h-8 w-24 shrink-0 rounded-md" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="skeleton h-14 rounded-lg" />
            ))}
          </div>
        </div>
      ) : null}

      <div
        className="rounded-xl border"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}
      >
        <div
          className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4"
          style={{ borderColor: 'var(--border-subtle)' }}
        >
          <div>
            <h3 className="text-[14px] font-semibold text-foreground">
              API keys
            </h3>
            <p
              className="mt-0.5 text-[12px]"
              style={{ color: 'var(--text-3)' }}
            >
              Send <code className="font-mono">x-api-key</code> on each
              request.
              {isPro
                ? ' Pro: multiple active keys.'
                : ' Free: one active key.'}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {keys.length > 0 ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => revokeMutation.mutate()}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-(--border) px-3 text-[12px] font-medium text-(--text-2) transition-colors hover:border-(--btn-danger-hover-border) hover:bg-(--btn-danger-hover-bg) hover:text-(--btn-danger-hover-fg) disabled:opacity-40 focus-visible-ring"
              >
                <Trash2 className="h-3.5 w-3.5" />
                Revoke all
              </button>
            ) : null}
            {isPro && keys.length > 0 ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => createMutation.mutate({ additional: true })}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-(--border) px-3 text-[12px] font-medium text-(--text-2) transition-colors hover:bg-(--bg-raised) disabled:opacity-40 focus-visible-ring"
              >
                <Plus className="h-3.5 w-3.5" />
                Add key
              </button>
            ) : null}
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                if (keys.length === 0) {
                  createMutation.mutate({});
                  return;
                }
                const primary =
                  keys.find((k) => k.isPrimary) ?? keys[0] ?? null;
                if (!primary) return;
                createMutation.mutate({ rotateKeyId: primary.id });
              }}
              className="btn-primary h-8 text-[13px] disabled:opacity-50 focus-visible-ring"
            >
              {keys.length > 0 ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Rotate primary
                </>
              ) : (
                'Create key'
              )}
            </button>
          </div>
        </div>

        <div className="space-y-4 p-5">
          {msg ? (
            <div
              className="flex items-start gap-2 rounded-lg border px-3 py-3 text-[13px]"
              style={{
                borderColor: 'var(--callout-warning-border)',
                background: 'var(--callout-warning-bg)',
                color: 'var(--callout-warning-fg)',
              }}
            >
              <AlertCircle
                className="mt-0.5 h-4 w-4 shrink-0"
                style={{ color: 'var(--callout-warning-icon)' }}
              />
              {msg}
            </div>
          ) : null}

          {rawKey ? (
            <div
              className="rounded-lg border p-4"
              style={{
                borderColor: 'var(--key-reveal-border)',
                background: 'var(--key-reveal-bg)',
              }}
            >
              <p
                className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: 'var(--accent)' }}
              >
                Copy your key, shown only once
              </p>
              <div
                className="flex items-center gap-2 rounded-lg border px-3 py-2.5"
                style={{
                  borderColor: 'var(--border)',
                  background: 'var(--bg-raised)',
                }}
              >
                <code className="flex-1 break-all font-mono text-[13px] text-foreground">
                  {rawKey}
                </code>
                <CopyFieldButton text={rawKey} label="Copy" />
              </div>
            </div>
          ) : null}

          {keys.length > 0 ? (
            <ul className="space-y-3">
              {keys.map((k) => (
                <li
                  key={k.id}
                  className="rounded-lg border px-4 py-4"
                  style={{
                    borderColor: 'var(--border-subtle)',
                    background: 'var(--bg-raised)',
                  }}
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {k.isPrimary ? (
                          <span
                            className="inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                            style={{
                              borderColor: 'var(--accent)',
                              color: 'var(--accent)',
                              background: 'var(--bg-overlay)',
                            }}
                          >
                            Primary
                          </span>
                        ) : null}
                        {isPro && editingKeyId === k.id ? (
                          <form
                            method="post"
                            className="flex min-w-0 flex-1 flex-wrap items-center gap-2"
                            onSubmit={(e) => {
                              e.preventDefault();
                              if (labelMutation.isPending) return;
                              labelMutation.mutate({
                                keyId: k.id,
                                label: labelDraft,
                              });
                            }}
                          >
                            <input
                              type="text"
                              value={labelDraft}
                              onChange={(e) => setLabelDraft(e.target.value)}
                              maxLength={64}
                              placeholder="Label"
                              autoComplete="off"
                              className="h-8 min-w-32 flex-1 rounded-md border px-2.5 text-[13px] text-foreground focus-visible-ring"
                              style={{
                                borderColor: 'var(--border)',
                                background: 'var(--bg-subtle)',
                              }}
                              aria-label="API key label"
                            />
                            <button
                              type="submit"
                              disabled={labelMutation.isPending}
                              className="h-8 rounded-md border border-(--border) px-2.5 text-[12px] font-medium text-(--text-2) hover:bg-(--bg-subtle) disabled:opacity-50 focus-visible-ring"
                            >
                              Save
                            </button>
                            <button
                              type="button"
                              disabled={labelMutation.isPending}
                              onClick={() => setEditingKeyId(null)}
                              className="h-8 rounded-md px-2 text-[12px] text-(--text-3) hover:text-foreground focus-visible-ring"
                            >
                              Cancel
                            </button>
                          </form>
                        ) : (
                          <div className="flex min-w-0 flex-wrap items-center gap-2">
                            <p className="text-[12px] font-medium text-foreground">
                              {(() => {
                                const t = k.label.trim();
                                if (k.isPrimary && (!t || t === 'default')) {
                                  return 'Primary key';
                                }
                                if (t) return k.label;
                                return 'Unnamed key';
                              })()}
                            </p>
                            {isPro ? (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() => {
                                  setEditingKeyId(k.id);
                                  setLabelDraft(k.label);
                                }}
                                className="inline-flex h-7 items-center gap-1 rounded-md border border-transparent px-1.5 text-[11px] font-medium text-(--accent) hover:border-(--border) hover:bg-(--bg-subtle) disabled:opacity-40 focus-visible-ring"
                              >
                                <Pencil className="h-3 w-3" aria-hidden />
                                Rename
                              </button>
                            ) : null}
                          </div>
                        )}
                      </div>
                      <p
                        className="text-[11px]"
                        style={{ color: 'var(--text-3)' }}
                      >
                        Key prefix
                      </p>
                      <p className="mt-1 font-mono text-[14px]">
                        <span className="text-foreground">{k.keyPrefix}</span>
                        <span style={{ color: 'var(--text-3)' }}>
                          {'•'.repeat(20)}
                        </span>
                      </p>
                      <div
                        className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t pt-3 text-[12px]"
                        style={{
                          borderColor: 'var(--border-subtle)',
                          color: 'var(--text-3)',
                        }}
                      >
                        <span>Created {fmtDate(k.createdAt)}</span>
                        <span>
                          {k.lastUsedAt
                            ? `Last used ${fmtDate(k.lastUsedAt)}`
                            : 'Never used'}
                        </span>
                      </div>
                    </div>
                    <div className="flex shrink-0 flex-col gap-2 sm:flex-row">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          createMutation.mutate({ rotateKeyId: k.id })
                        }
                        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-(--border) px-3 text-[12px] font-medium text-(--text-2) transition-colors hover:bg-(--bg-subtle) disabled:opacity-40 focus-visible-ring"
                      >
                        <RefreshCw className="h-3.5 w-3.5" />
                        Rotate
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => revokeOneMutation.mutate(k.id)}
                        className="inline-flex h-8 items-center gap-1.5 rounded-md border border-(--border) px-3 text-[12px] font-medium text-(--text-2) transition-colors hover:border-(--btn-danger-hover-border) hover:bg-(--btn-danger-hover-bg) hover:text-(--btn-danger-hover-fg) disabled:opacity-40 focus-visible-ring"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                        Revoke
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div
              className="rounded-lg border border-dashed px-6 py-8 text-center"
              style={{ borderColor: 'var(--border)' }}
            >
              <p className="text-[14px] font-medium text-foreground">
                No API key yet
              </p>
              <p
                className="mt-1 text-[13px]"
                style={{ color: 'var(--text-3)' }}
              >
                Click &ldquo;Create key&rdquo; above to generate one.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatBox({
  label,
  value,
  accent,
}: {
  label: string;
  value: number;
  accent: string;
}) {
  return (
    <div
      className="rounded-lg border px-3 py-3"
      style={{
        borderColor: 'var(--border-subtle)',
        background: 'var(--bg-raised)',
      }}
    >
      <p className="text-[11px] font-medium" style={{ color: 'var(--text-3)' }}>
        {label}
      </p>
      <p
        className="mt-1 font-display text-[1.35rem] font-semibold tabular-nums tracking-tight"
        style={{ color: accent }}
      >
        {value}
      </p>
    </div>
  );
}
