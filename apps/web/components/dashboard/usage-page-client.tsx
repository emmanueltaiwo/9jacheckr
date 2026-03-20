'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { RefreshCw } from 'lucide-react';
import { appApiGet } from '@/lib/api';
import type { MetricResponse } from './types';

export function UsagePageClient() {
  const metricsQuery = useQuery({
    queryKey: ['metrics'],
    queryFn: () => appApiGet<MetricResponse>('/api/metrics/me'),
  });

  const metric = metricsQuery.data?.metrics;
  const month = metricsQuery.data?.month;
  const loadingMetrics = metricsQuery.isPending || metricsQuery.isFetching;

  const rows = [
    { label: 'Total calls', value: metric?.total ?? 0 },
    { label: 'Found', value: metric?.found ?? 0 },
    { label: 'Not found', value: metric?.notFound ?? 0 },
    { label: 'Failed', value: metric?.failed ?? 0 },
  ];

  return (
    <div className="space-y-10">
      <header>
        <h1 className="font-display text-3xl font-semibold tracking-tight text-[#eceae1] sm:text-[2rem]">
          Usage
        </h1>
        <p className="mt-2 text-[15px] text-stone-500">
          Calendar month totals (UTC) for verify requests from your API key.
          {month ? (
            <span className="ml-1 font-mono text-stone-600">{month}</span>
          ) : null}
        </p>
      </header>

      <section>
        <h2 className="text-xs font-semibold uppercase tracking-[0.12em] text-stone-500">
          Summary
        </h2>
        <div className="mt-3 overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a08]">
          {metricsQuery.isError ? (
            <div className="flex items-center justify-between gap-3 p-5">
              <p className="text-sm text-rose-300">Could not load usage.</p>
              <button
                type="button"
                onClick={() => metricsQuery.refetch()}
                className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 px-3 py-1.5 text-xs text-stone-400 hover:bg-white/5"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Retry
              </button>
            </div>
          ) : (
            <div className="grid gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
              {rows.map((row) => (
                <div key={row.label} className="bg-[#050504] p-5">
                  <p className="text-xs text-stone-600">{row.label}</p>
                  <p className="mt-1 font-mono text-2xl font-semibold tabular-nums text-[#eceae1]">
                    {loadingMetrics ? (
                      <span className="skeleton inline-block h-8 w-12 rounded-md" />
                    ) : (
                      row.value
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Link
        href="/dashboard/key"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#dfff1f] transition hover:text-[#f0ff6a]"
      >
        ← Manage API key
      </Link>
    </div>
  );
}
