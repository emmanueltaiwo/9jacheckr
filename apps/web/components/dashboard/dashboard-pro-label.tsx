'use client';

import { useQuery } from '@tanstack/react-query';
import {
  apiBillingQueryKey,
  fetchApiBillingStatus,
} from '@/lib/api-billing-query';

export function DashboardProLabel({ apiBaseUrl }: { apiBaseUrl: string }) {
  const base = apiBaseUrl.replace(/\/$/, '');
  const q = useQuery({
    queryKey: apiBillingQueryKey(base),
    queryFn: () => fetchApiBillingStatus(base),
    enabled: Boolean(base),
    staleTime: 60 * 1000,
  });

  if (!base || !q.isSuccess || q.data.plan !== 'pro_api') return null;

  return (
    <span
      className="inline-flex shrink-0 items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
      style={{
        borderColor: 'var(--accent)',
        color: 'var(--accent)',
        background: 'var(--bg-overlay)',
      }}
    >
      API Pro
    </span>
  );
}
