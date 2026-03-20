'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ArrowRight, KeyRound, LineChart } from 'lucide-react';
import { appApiGet } from '@/lib/api';
import { CurlCard } from './curl-card';
import type { KeyResponse, MetricResponse } from './types';

export function HomePageClient({ apiBaseUrl }: { apiBaseUrl: string }) {
  const keyQuery = useQuery({
    queryKey: ['key'],
    queryFn: () => appApiGet<KeyResponse>('/api/keys/me'),
  });

  const metricsQuery = useQuery({
    queryKey: ['metrics'],
    queryFn: () => appApiGet<MetricResponse>('/api/metrics/me'),
  });

  const hasKey = Boolean(keyQuery.data?.key);
  const total = metricsQuery.data?.metrics?.total ?? null;
  const loadingKey = keyQuery.isPending;
  const loadingMetrics = metricsQuery.isPending;

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-[#eceae1] sm:text-[2rem]">
          Home
        </h1>
        <p className="mt-2 text-[15px] text-stone-500">
          Jump to your key, usage, or copy an example request.
        </p>
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link
          href="/dashboard/key"
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a08] p-6 transition hover:border-[#dfff1f]/25 hover:bg-[#0c0c0a]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#dfff1f]/12 text-[#dfff1f] ring-1 ring-[#dfff1f]/20">
            <KeyRound className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <h2 className="mt-4 font-display text-lg font-semibold text-[#eceae1]">
            API key
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            {loadingKey
              ? 'Loading…'
              : hasKey
                ? 'Key is set — rotate or revoke anytime.'
                : 'Create a key to call the API.'}
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#dfff1f]">
            Open
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
        </Link>

        <Link
          href="/dashboard/usage"
          className="group relative overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a08] p-6 transition hover:border-[#dfff1f]/25 hover:bg-[#0c0c0a]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/5 text-stone-400 ring-1 ring-white/10">
            <LineChart className="h-5 w-5" strokeWidth={1.75} />
          </div>
          <h2 className="mt-4 font-display text-lg font-semibold text-[#eceae1]">
            Usage
          </h2>
          <p className="mt-1 text-sm text-stone-500">
            {loadingMetrics
              ? 'Loading…'
              : total !== null
                ? `${total} verify calls this month (UTC).`
                : 'See monthly verify totals.'}
          </p>
          <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-[#dfff1f]">
            Open
            <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
          </span>
        </Link>
      </div>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
          Try the API
        </h2>
        <p className="mt-2 text-sm text-stone-500">
          After you have a key, paste it into the command below.
        </p>
        <div className="mt-4">
          <CurlCard apiBaseUrl={apiBaseUrl} />
        </div>
      </section>
    </div>
  );
}
