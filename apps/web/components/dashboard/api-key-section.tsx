'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import { clsx } from 'clsx';
import { CopyFieldButton } from './copy-field-button';

type ApiKeyInfo = {
  keyPrefix: string;
  lastUsedAt: string | null;
  createdAt: string;
};

type MeJson = { ok: boolean; apiKey: ApiKeyInfo | null };
type CreateJson = { ok: boolean; rawKey: string; apiKey: ApiKeyInfo };
type RevokeJson = { ok: boolean; revokedAt: string | null };

type UsageMetrics = {
  totalVerifications: number;
  foundCount: number;
  notFoundCount: number;
  errorCount: number;
  lastVerifyAt: string | null;
};

type MetricsJson = { ok: boolean; metrics: UsageMetrics };

async function fetchApiKeyMe(base: string): Promise<ApiKeyInfo | null> {
  const res = await fetch(`${base}/api/keys/me`, { credentials: 'include' });
  const data = (await res.json()) as MeJson;
  if (!res.ok || !data.ok) {
    throw new Error('Could not load key status.');
  }
  return data.apiKey;
}

async function fetchApiKeyMetrics(base: string): Promise<UsageMetrics> {
  const res = await fetch(`${base}/api/keys/metrics`, {
    credentials: 'include',
  });
  const data = (await res.json()) as MetricsJson;
  if (!res.ok || !data.ok || !data.metrics) {
    throw new Error('Could not load usage metrics.');
  }
  return data.metrics;
}

export function ApiKeySection({ apiBaseUrl }: { apiBaseUrl: string }) {
  const base = apiBaseUrl.replace(/\/$/, '');
  const queryClient = useQueryClient();
  const [rawKey, setRawKey] = useState<string | null>(null);

  const keyQuery = useQuery({
    queryKey: ['api-keys', 'me', base],
    queryFn: () => fetchApiKeyMe(base),
    enabled: Boolean(base),
    staleTime: 60 * 1000,
  });

  const metricsQuery = useQuery({
    queryKey: ['api-keys', 'metrics', base],
    queryFn: () => fetchApiKeyMetrics(base),
    enabled: Boolean(base),
    staleTime: 60 * 1000,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${base}/api/keys/create`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      const data = (await res.json()) as CreateJson;
      if (!res.ok || !data.ok) {
        throw new Error('Could not create or rotate key.');
      }
      return data;
    },
    onMutate: () => {
      setRawKey(null);
    },
    onSuccess: (data) => {
      setRawKey(data.rawKey);
      queryClient.setQueryData<ApiKeyInfo | null>(
        ['api-keys', 'me', base],
        data.apiKey,
      );
      void queryClient.invalidateQueries({
        queryKey: ['api-keys', 'metrics', base],
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
        throw new Error('Could not revoke key.');
      }
      return data;
    },
    onMutate: () => {
      setRawKey(null);
    },
    onSuccess: () => {
      queryClient.setQueryData<ApiKeyInfo | null>(
        ['api-keys', 'me', base],
        null,
      );
      void queryClient.invalidateQueries({
        queryKey: ['api-keys', 'metrics', base],
      });
    },
  });

  const busy = createMutation.isPending || revokeMutation.isPending;
  const info = keyQuery.data;
  const metrics = metricsQuery.data;
  const mutationError =
    createMutation.error?.message ?? revokeMutation.error?.message ?? null;
  const msg = mutationError;

  if (!base) {
    return (
      <div
        className="rounded-xl border px-4 py-3 text-[13px]"
        style={{
          borderColor: 'rgba(251,191,36,0.25)',
          background: 'rgba(251,191,36,0.07)',
          color: 'rgb(253,230,138)',
        }}
      >
        Set{' '}
        <span className="font-mono text-amber-200">
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
          borderColor: 'rgba(251,191,36,0.25)',
          background: 'rgba(251,191,36,0.07)',
          color: 'rgb(253,230,138)',
        }}
      >
        <div className="flex items-start gap-2">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
          {keyQuery.error instanceof Error
            ? keyQuery.error.message
            : 'Could not load key status.'}
        </div>
        <button
          type="button"
          onClick={() => void keyQuery.refetch()}
          className="rounded-md border border-amber-400/40 px-3 py-1.5 text-[12px] font-medium text-amber-100 hover:bg-amber-500/10 focus-visible-ring"
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
      {metricsQuery.isSuccess && metrics ? (
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
              value={metrics.totalVerifications}
              accent="var(--text)"
            />
            <StatBox
              label="Found"
              value={metrics.foundCount}
              accent="rgb(134,239,172)"
            />
            <StatBox
              label="Not found"
              value={metrics.notFoundCount}
              accent="rgb(253,224,71)"
            />
            <StatBox
              label="Errors"
              value={metrics.errorCount}
              accent="rgb(252,165,165)"
            />
          </div>
          <p className="mt-3 text-[12px]" style={{ color: 'var(--text-3)' }}>
            {metrics.lastVerifyAt
              ? `Last verify ${fmtDate(metrics.lastVerifyAt)}`
              : 'No verify requests yet'}
          </p>
        </div>
      ) : metricsQuery.isError ? (
        <div
          className="rounded-xl border px-5 py-4"
          style={{
            borderColor: 'var(--border)',
            background: 'var(--bg-subtle)',
          }}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-start gap-2 text-[13px] text-amber-200/90">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              <span>
                {metricsQuery.error instanceof Error
                  ? metricsQuery.error.message
                  : 'Could not load usage metrics.'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => void metricsQuery.refetch()}
              disabled={metricsQuery.isFetching}
              className="inline-flex h-8 shrink-0 items-center gap-1.5 rounded-md border border-amber-400/35 px-3 text-[12px] font-medium text-amber-100 transition-colors hover:bg-amber-500/10 disabled:opacity-50 focus-visible-ring"
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
              {info ? 'Active key' : 'No API key'}
            </h3>
            <p
              className="mt-0.5 text-[12px]"
              style={{ color: 'var(--text-3)' }}
            >
              Passed as <code className="font-mono">x-api-key</code> on every
              request. One key per account.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {info ? (
              <button
                type="button"
                disabled={busy}
                onClick={() => revokeMutation.mutate()}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border px-3 text-[12px] font-medium transition-colors disabled:opacity-40 focus-visible-ring"
                style={{ borderColor: 'var(--border)', color: 'var(--text-2)' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    'rgba(239,68,68,0.4)';
                  (e.currentTarget as HTMLButtonElement).style.color =
                    'rgb(252,165,165)';
                  (e.currentTarget as HTMLButtonElement).style.background =
                    'rgba(239,68,68,0.08)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor =
                    'var(--border)';
                  (e.currentTarget as HTMLButtonElement).style.color =
                    'var(--text-2)';
                  (e.currentTarget as HTMLButtonElement).style.background = '';
                }}
              >
                <Trash2 className="h-3.5 w-3.5" />
                Revoke
              </button>
            ) : null}
            <button
              type="button"
              disabled={busy}
              onClick={() => createMutation.mutate()}
              className="btn-primary h-8 text-[13px] disabled:opacity-50 focus-visible-ring"
            >
              {info ? (
                <>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Rotate
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
                borderColor: 'rgba(251,191,36,0.25)',
                background: 'rgba(251,191,36,0.07)',
                color: 'rgb(253,230,138)',
              }}
            >
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
              {msg}
            </div>
          ) : null}

          {rawKey ? (
            <div
              className="rounded-lg border p-4"
              style={{
                borderColor: 'rgba(223,255,31,0.2)',
                background: 'rgba(223,255,31,0.04)',
              }}
            >
              <p
                className="mb-3 text-[11px] font-semibold uppercase tracking-[0.14em]"
                style={{ color: '#dfff1f' }}
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

          {info ? (
            <div
              className="rounded-lg border px-4 py-4"
              style={{
                borderColor: 'var(--border-subtle)',
                background: 'var(--bg-raised)',
              }}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[11px]" style={{ color: 'var(--text-3)' }}>
                    Key prefix
                  </p>
                  <p className="mt-1 font-mono text-[14px]">
                    <span className="text-foreground">{info.keyPrefix}</span>
                    <span style={{ color: 'var(--text-3)' }}>
                      {'•'.repeat(20)}
                    </span>
                  </p>
                </div>
                <span
                  className="inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[11px] font-medium"
                  style={{
                    borderColor: 'rgba(134,239,172,0.2)',
                    background: 'rgba(134,239,172,0.08)',
                    color: 'rgb(134,239,172)',
                  }}
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  Active
                </span>
              </div>
              <div
                className="mt-3 flex flex-wrap gap-x-5 gap-y-1 border-t pt-3 text-[12px]"
                style={{
                  borderColor: 'var(--border-subtle)',
                  color: 'var(--text-3)',
                }}
              >
                <span>Created {fmtDate(info.createdAt)}</span>
                <span>
                  {info.lastUsedAt
                    ? `Last used ${fmtDate(info.lastUsedAt)}`
                    : 'Never used'}
                </span>
              </div>
            </div>
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
