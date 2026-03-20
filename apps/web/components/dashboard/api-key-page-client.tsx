'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import {
  AlertCircle,
  CheckCircle2,
  Copy,
  Loader2,
  RefreshCw,
  Trash2,
} from 'lucide-react';
import { useState } from 'react';
import { appApiDelete, appApiGet, appApiPost } from '@/lib/api';
import type { CreateKeyResponse, KeyResponse } from './types';

export function ApiKeyPageClient() {
  const queryClient = useQueryClient();
  const keyQuery = useQuery({
    queryKey: ['key'],
    queryFn: () => appApiGet<KeyResponse>('/api/keys/me'),
  });

  const createMutation = useMutation({
    mutationFn: () => appApiPost<CreateKeyResponse>('/api/keys/create'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['key'] }),
  });

  const revokeMutation = useMutation({
    mutationFn: () => appApiDelete<{ ok: true }>('/api/keys/me'),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['key'] }),
  });

  const key = keyQuery.data?.key;
  const rawKey = createMutation.data?.key?.rawKey;
  const [rawCopied, setRawCopied] = useState(false);

  async function copyRaw() {
    if (!rawKey) return;
    await navigator.clipboard.writeText(rawKey);
    setRawCopied(true);
    setTimeout(() => setRawCopied(false), 2000);
  }

  return (
    <div className="space-y-8">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-[#eceae1] sm:text-[2rem]">
          API key
        </h1>
        <p className="mt-2 text-[15px] text-stone-500">
          One key per account. The full secret is shown only once.
        </p>
      </header>

      <div className="rounded-2xl border border-white/10 bg-[#0a0a08]">
        <div className="flex flex-wrap gap-3 border-b border-white/10 p-5">
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-[#dfff1f] px-5 py-2.5 text-sm font-semibold text-black transition hover:bg-[#f0ff6a] active:scale-[0.98] disabled:opacity-50"
            onClick={() => createMutation.mutate()}
            disabled={createMutation.isPending}
          >
            {createMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : null}
            {key ? 'Rotate key' : 'Create key'}
          </button>
          <button
            type="button"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/15 px-5 py-2.5 text-sm text-stone-300 transition hover:border-rose-400/35 hover:bg-rose-500/5 hover:text-rose-200 active:scale-[0.98] disabled:opacity-40"
            onClick={() => revokeMutation.mutate()}
            disabled={revokeMutation.isPending || !key}
          >
            {revokeMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
            Revoke
          </button>
        </div>

        <div className="grid divide-y divide-white/10 sm:grid-cols-2 sm:divide-x sm:divide-y-0">
          <div className="p-5">
            <p className="text-xs font-medium text-stone-600">Current key</p>
            <p className="mt-2 font-mono text-sm text-[#eceae1]">
              {keyQuery.isPending ? (
                <span className="skeleton inline-block h-5 w-44 rounded-md" />
              ) : key ? (
                key.maskedKey
              ) : (
                <span className="text-stone-600">No key yet</span>
              )}
            </p>
          </div>
          <div className="p-5">
            <p className="text-xs font-medium text-stone-600">Last used</p>
            <p className="mt-2 text-sm text-stone-400">
              {keyQuery.isPending ? (
                <span className="skeleton inline-block h-5 w-48 rounded-md" />
              ) : key?.lastUsedAt ? (
                new Date(key.lastUsedAt).toLocaleString()
              ) : (
                'Never'
              )}
            </p>
          </div>
        </div>

        {keyQuery.isError ? (
          <div className="flex items-center justify-between gap-3 border-t border-white/10 p-5">
            <p className="text-sm text-rose-300">Could not load your key.</p>
            <button
              type="button"
              onClick={() => keyQuery.refetch()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-stone-400 hover:bg-white/5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Retry
            </button>
          </div>
        ) : null}

        {rawKey ? (
          <div className="border-t border-[#dfff1f]/25 bg-[#dfff1f]/6 p-5">
            <p className="text-xs font-medium text-[#dfff1f]">
              Copy this now — we will not show it again
            </p>
            <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="min-w-0 break-all font-mono text-sm text-[#eceae1]">
                {rawKey}
              </p>
              <button
                type="button"
                onClick={() => void copyRaw()}
                className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl border border-[#dfff1f]/40 bg-[#dfff1f]/12 px-4 py-2.5 text-sm font-medium text-[#dfff1f] transition hover:bg-[#dfff1f]/18"
              >
                {rawCopied ? (
                  <CheckCircle2 className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
                {rawCopied ? 'Copied' : 'Copy key'}
              </button>
            </div>
          </div>
        ) : null}

        {(createMutation.isError || revokeMutation.isError) && (
          <div className="flex items-start gap-2 border-t border-rose-500/20 bg-rose-500/5 p-5 text-sm text-rose-200">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
            Something went wrong. Try again.
          </div>
        )}
      </div>

      <Link
        href="/dashboard/usage"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#dfff1f] transition hover:text-[#f0ff6a]"
      >
        View monthly usage →
      </Link>
    </div>
  );
}
