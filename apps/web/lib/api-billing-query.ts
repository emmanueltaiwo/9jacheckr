export type ApiBillingStatus = {
  plan: string;
  monthlyUsed: number;
  monthlyLimit: number;
  monthlyVerifyUsed?: number;
  monthlySearchUsed?: number;
};

type BillingJson = {
  ok: boolean;
  billing?: ApiBillingStatus;
};

export function apiBillingQueryKey(base: string) {
  return ['api-keys', 'billing', base] as const;
}

export async function fetchApiBillingStatus(
  base: string,
): Promise<ApiBillingStatus> {
  const res = await fetch(`${base}/api/keys/billing/status`, {
    credentials: 'include',
    cache: 'no-store',
  });
  const data = (await res.json()) as BillingJson;
  if (!res.ok || !data.ok || !data.billing) {
    throw new Error('billing');
  }
  return data.billing;
}
