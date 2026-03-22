'use client';

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  ExternalLink,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import { clsx } from 'clsx';

type BillingAccountJson = {
  ok: boolean;
  account?: {
    plan: string;
    monthlyUsed: number;
    monthlyLimit: number;
    hasCustomerProfile: boolean;
    subscription: null | {
      paystackStatus: string | null;
      nextPaymentDate: string | null;
      amountKobo: number | null;
      currency: string;
      planName: string | null;
      planInterval: string | null;
      currentPeriodEnd: string | null;
      updatePaymentMethodUrl: string | null;
      canCancel: boolean;
      syncError: string | null;
    };
  };
};

type TransactionsJson = {
  ok: boolean;
  transactions?: Array<{
    reference: string;
    amountKobo: number;
    currency: string;
    status: string;
    paidAt: string | null;
    createdAt: string | null;
    channel: string | null;
    description: string | null;
  }>;
  meta?: { total: number; page: number; pageCount: number };
};

function formatMoney(amountKobo: number, currency: string) {
  const major = amountKobo / 100;
  try {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: currency === 'NGN' ? 'NGN' : 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(major);
  } catch {
    return `${currency} ${major.toFixed(2)}`;
  }
}

function fmtWhen(iso: string | null) {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

async function fetchBillingAccount(base: string): Promise<
  NonNullable<BillingAccountJson['account']>
> {
  const res = await fetch(`${base}/api/keys/billing/account`, {
    credentials: 'include',
    cache: 'no-store',
  });
  const data = (await res.json()) as BillingAccountJson;
  if (!res.ok || !data.ok || !data.account) {
    throw new Error('Could not load billing account.');
  }
  return data.account;
}

async function fetchTransactions(
  base: string,
  page: number,
): Promise<{
  transactions: NonNullable<TransactionsJson['transactions']>;
  meta: NonNullable<TransactionsJson['meta']>;
}> {
  const q = new URLSearchParams({ page: String(page) });
  const res = await fetch(
    `${base}/api/keys/billing/transactions?${q.toString()}`,
    {
      credentials: 'include',
      cache: 'no-store',
    },
  );
  const data = (await res.json()) as TransactionsJson & { message?: string };
  if (!res.ok || !data.ok) {
    throw new Error(data.message ?? 'Could not load payment history.');
  }
  return {
    transactions: data.transactions ?? [],
    meta: data.meta ?? { total: 0, page: 1, pageCount: 0 },
  };
}

export function SettingsPageClient({ apiBaseUrl }: { apiBaseUrl: string }) {
  const base = apiBaseUrl.replace(/\/$/, '');
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const [txPage, setTxPage] = useState(1);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const billingSuccess = searchParams.get('billing') === 'success';
  const [dismissSuccess, setDismissSuccess] = useState(false);

  useEffect(() => {
    if (billingSuccess) {
      void queryClient.invalidateQueries({ queryKey: ['api-keys', 'billing'] });
    }
  }, [billingSuccess, queryClient]);

  const accountQuery = useQuery({
    queryKey: ['api-keys', 'billing', 'account', base],
    queryFn: () => fetchBillingAccount(base),
    enabled: Boolean(base),
    staleTime: 30 * 1000,
  });

  const txQuery = useQuery({
    queryKey: ['api-keys', 'billing', 'transactions', base, txPage],
    queryFn: () => fetchTransactions(base, txPage),
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

  const cancelMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`${base}/api/keys/billing/cancel-subscription`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      const data = (await res.json()) as { ok?: boolean; message?: string };
      if (!res.ok || !data.ok) {
        throw new Error(data.message ?? 'Could not cancel subscription.');
      }
    },
    onSuccess: () => {
      setShowCancelConfirm(false);
      void queryClient.invalidateQueries({ queryKey: ['api-keys', 'billing'] });
      void queryClient.invalidateQueries({ queryKey: ['api-keys', 'me', base] });
    },
  });

  const account = accountQuery.data;
  const isPro = account?.plan === 'pro_api';
  const sub = account?.subscription;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-display text-[1.5rem] font-semibold tracking-[-0.03em] text-foreground">
          Settings
        </h1>
        <p className="mt-1 text-[14px] text-(--text-2)">
          API plan, Paystack subscription, and payment history.
        </p>
      </div>

      {billingSuccess && !dismissSuccess ? (
        <div
          className="flex flex-wrap items-start justify-between gap-3 rounded-xl border px-4 py-3 text-[13px]"
          style={{
            borderColor: 'var(--accent)',
            background: 'var(--bg-subtle)',
            color: 'var(--text-2)',
          }}
        >
          <p>
            <span className="font-medium text-foreground">Payment received.</span>{' '}
            If your plan hasn&apos;t updated yet, wait a moment and refresh — or
            contact support if it takes more than a few minutes.
          </p>
          <button
            type="button"
            onClick={() => setDismissSuccess(true)}
            className="shrink-0 text-[12px] font-medium text-(--accent) underline-offset-2 hover:underline"
          >
            Dismiss
          </button>
        </div>
      ) : null}

      {accountQuery.isError ? (
        <div
          className="flex flex-col gap-3 rounded-xl border px-4 py-4 text-[13px]"
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
            {accountQuery.error instanceof Error
              ? accountQuery.error.message
              : 'Could not load settings.'}
          </div>
          <button
            type="button"
            onClick={() => void accountQuery.refetch()}
            className="self-start rounded-md border px-3 py-1.5 text-[12px] font-medium transition-colors focus-visible-ring"
            style={{
              borderColor: 'var(--callout-warning-btn-border)',
              color: 'var(--callout-warning-btn-fg)',
            }}
          >
            Retry
          </button>
        </div>
      ) : null}

      {accountQuery.isSuccess && account ? (
        <>
          <div
            className="rounded-xl border px-5 py-4"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--bg-subtle)',
            }}
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="text-[14px] font-semibold text-foreground">
                  Plan &amp; usage
                </h2>
                <p className="mt-1 text-[13px] text-(--text-2)">
                  {isPro ? (
                    <>
                      <span className="font-medium text-foreground">
                        API Pro
                      </span>{' '}
                      — successful verifies this month.
                    </>
                  ) : (
                    <>
                      <span className="font-medium text-foreground">Free</span>{' '}
                      — upgrade for higher limits and Pro-only endpoints.
                    </>
                  )}
                </p>
                <p className="mt-2 font-display text-[1.25rem] font-semibold tabular-nums text-foreground">
                  {account.monthlyUsed.toLocaleString()}
                  <span className="text-(--text-3)">
                    {' '}
                    / {account.monthlyLimit.toLocaleString()}
                  </span>
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => void accountQuery.refetch()}
                  disabled={accountQuery.isFetching}
                  className="inline-flex h-9 items-center gap-1.5 rounded-md border border-(--border) px-3 text-[12px] font-medium text-(--text-2) transition-colors hover:bg-(--bg-raised) disabled:opacity-50 focus-visible-ring"
                >
                  <RefreshCw
                    className={clsx(
                      'h-3.5 w-3.5',
                      accountQuery.isFetching && 'animate-spin',
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
                    {upgradeMutation.isPending ? (
                      <Loader2
                        className="h-3.5 w-3.5 animate-spin"
                        aria-hidden
                      />
                    ) : (
                      <CreditCard className="h-3.5 w-3.5" aria-hidden />
                    )}
                    Upgrade to Pro
                  </button>
                ) : null}
              </div>
            </div>
            {upgradeMutation.error ? (
              <p
                className="mt-3 text-[12px]"
                style={{ color: 'var(--callout-warning-fg)' }}
              >
                {upgradeMutation.error.message}
              </p>
            ) : null}
          </div>

          <div
            className="rounded-xl border px-5 py-4"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--bg-raised)',
            }}
          >
            <h2 className="text-[14px] font-semibold text-foreground">
              Paystack subscription
            </h2>
            <p className="mt-1 text-[13px] text-(--text-2)">
              Subscriptions are billed by Paystack. You can update your card on
              their secure page or cancel here; the app switches to Free after
              Paystack confirms cancellation.
            </p>

            {!isPro && !sub ? (
              <p className="mt-4 text-[13px] text-(--text-2)">
                You&apos;re not subscribed to API Pro.{' '}
                <Link
                  href="/dashboard/keys"
                  className="font-medium text-(--accent) underline-offset-2 hover:underline"
                >
                  API Keys
                </Link>{' '}
                has the same upgrade flow.
              </p>
            ) : null}

            {isPro && sub?.syncError ? (
              <div
                className="mt-4 flex items-start gap-2 rounded-lg border px-3 py-2.5 text-[12px]"
                style={{
                  borderColor: 'var(--callout-warning-border)',
                  background: 'var(--callout-warning-bg)',
                  color: 'var(--callout-warning-fg)',
                }}
              >
                <AlertCircle
                  className="mt-0.5 h-3.5 w-3.5 shrink-0"
                  style={{ color: 'var(--callout-warning-icon)' }}
                />
                <span>
                  Could not sync with Paystack: {sub.syncError}. If you need to
                  cancel or change your card, use the email from Paystack or
                  contact support.
                </span>
              </div>
            ) : null}

            {isPro && sub && !sub.syncError ? (
              <dl className="mt-4 space-y-2 text-[13px]">
                <div className="flex flex-wrap justify-between gap-2">
                  <dt className="text-(--text-3)">Status</dt>
                  <dd className="font-medium capitalize text-foreground">
                    {sub.paystackStatus ?? '—'}
                  </dd>
                </div>
                {sub.planName ? (
                  <div className="flex flex-wrap justify-between gap-2">
                    <dt className="text-(--text-3)">Plan</dt>
                    <dd className="text-foreground">{sub.planName}</dd>
                  </div>
                ) : null}
                {sub.amountKobo != null && sub.amountKobo > 0 ? (
                  <div className="flex flex-wrap justify-between gap-2">
                    <dt className="text-(--text-3)">Amount</dt>
                    <dd className="tabular-nums text-foreground">
                      {formatMoney(sub.amountKobo, sub.currency)}
                      {sub.planInterval ? (
                        <span className="text-(--text-3)">
                          {' '}
                          / {sub.planInterval}
                        </span>
                      ) : null}
                    </dd>
                  </div>
                ) : null}
                <div className="flex flex-wrap justify-between gap-2">
                  <dt className="text-(--text-3)">Next payment</dt>
                  <dd className="text-foreground">
                    {fmtWhen(sub.nextPaymentDate)}
                  </dd>
                </div>
                <div className="flex flex-wrap justify-between gap-2">
                  <dt className="text-(--text-3)">Period end (app)</dt>
                  <dd className="text-foreground">
                    {fmtWhen(sub.currentPeriodEnd)}
                  </dd>
                </div>
              </dl>
            ) : null}

            {isPro && sub && !sub.syncError ? (
              <div className="mt-5 flex flex-wrap gap-2">
                {sub.updatePaymentMethodUrl ? (
                  <a
                    href={sub.updatePaymentMethodUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex h-9 items-center gap-1.5 rounded-md border border-(--border) bg-(--bg-subtle) px-3 text-[12px] font-medium text-(--text-2) transition-colors hover:bg-(--bg-overlay) focus-visible-ring"
                  >
                    Update card
                    <ExternalLink className="h-3.5 w-3.5" aria-hidden />
                  </a>
                ) : null}
                {sub.canCancel ? (
                  <button
                    type="button"
                    onClick={() => setShowCancelConfirm(true)}
                    disabled={cancelMutation.isPending}
                    className="inline-flex h-9 items-center rounded-md border border-(--callout-warning-border) px-3 text-[12px] font-medium transition-colors hover:bg-(--callout-warning-bg) disabled:opacity-50 focus-visible-ring"
                    style={{ color: 'var(--callout-warning-fg)' }}
                  >
                    Cancel subscription
                  </button>
                ) : null}
              </div>
            ) : null}

            {cancelMutation.error ? (
              <p
                className="mt-3 text-[12px]"
                style={{ color: 'var(--callout-warning-fg)' }}
              >
                {cancelMutation.error.message}
              </p>
            ) : null}
          </div>

          <div
            className="rounded-xl border px-5 py-4"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--bg-subtle)',
            }}
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-[14px] font-semibold text-foreground">
                Payment history
              </h2>
              <button
                type="button"
                onClick={() => void txQuery.refetch()}
                disabled={txQuery.isFetching}
                className="inline-flex h-8 items-center gap-1.5 rounded-md border border-(--border) px-2.5 text-[12px] font-medium text-(--text-2) hover:bg-(--bg-raised) disabled:opacity-50 focus-visible-ring"
              >
                <RefreshCw
                  className={clsx(
                    'h-3.5 w-3.5',
                    txQuery.isFetching && 'animate-spin',
                  )}
                  aria-hidden
                />
                Refresh
              </button>
            </div>
            <p className="mt-1 text-[12px] text-(--text-3)">
              Your payment history for this account.
            </p>

            {txQuery.isError ? (
              <p
                className="mt-4 text-[13px]"
                style={{ color: 'var(--callout-warning-fg)' }}
              >
                {txQuery.error instanceof Error
                  ? txQuery.error.message
                  : 'Could not load history.'}
              </p>
            ) : txQuery.isPending ? (
              <div className="mt-6 flex justify-center py-8">
                <Loader2
                  className="h-6 w-6 animate-spin text-(--text-3)"
                  aria-hidden
                />
              </div>
            ) : !txQuery.data?.transactions.length ? (
              <p className="mt-4 text-[13px] text-(--text-2)">
                {account.hasCustomerProfile
                  ? 'No transactions returned yet.'
                  : 'No Paystack customer on file — history appears after you subscribe.'}
              </p>
            ) : (
              <>
                <div className="mt-4 overflow-x-auto rounded-lg border border-(--border-subtle)">
                  <table className="w-full min-w-[520px] border-collapse text-left text-[12px]">
                    <thead>
                      <tr
                        className="border-b border-(--border-subtle)"
                        style={{ color: 'var(--text-3)' }}
                      >
                        <th className="px-3 py-2 font-medium">When</th>
                        <th className="px-3 py-2 font-medium">Amount</th>
                        <th className="px-3 py-2 font-medium">Status</th>
                        <th className="px-3 py-2 font-medium">Channel</th>
                        <th className="px-3 py-2 font-medium">Reference</th>
                      </tr>
                    </thead>
                    <tbody>
                      {txQuery.data.transactions.map((row) => (
                        <tr
                          key={row.reference}
                          className="border-b border-(--border-subtle) last:border-0"
                        >
                          <td className="px-3 py-2.5 text-foreground">
                            {fmtWhen(row.paidAt || row.createdAt)}
                          </td>
                          <td className="px-3 py-2.5 tabular-nums text-foreground">
                            {formatMoney(row.amountKobo, row.currency)}
                          </td>
                          <td className="px-3 py-2.5 capitalize text-foreground">
                            {row.status}
                          </td>
                          <td className="px-3 py-2.5 text-(--text-2)">
                            {row.channel ?? '—'}
                          </td>
                          <td
                            className="max-w-[140px] truncate px-3 py-2.5 font-mono text-[11px] text-(--text-3)"
                            title={row.reference}
                          >
                            {row.reference}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {txQuery.data.meta.pageCount > 1 ? (
                  <div className="mt-4 flex items-center justify-between gap-2">
                    <button
                      type="button"
                      disabled={txPage <= 1 || txQuery.isFetching}
                      onClick={() => setTxPage((p) => Math.max(1, p - 1))}
                      className="inline-flex items-center gap-1 rounded-md border border-(--border) px-2 py-1.5 text-[12px] font-medium text-(--text-2) disabled:opacity-40"
                    >
                      <ChevronLeft className="h-4 w-4" aria-hidden />
                      Previous
                    </button>
                    <span className="text-[12px] text-(--text-3)">
                      Page {txQuery.data.meta.page} of{' '}
                      {txQuery.data.meta.pageCount}
                    </span>
                    <button
                      type="button"
                      disabled={
                        txPage >= txQuery.data.meta.pageCount ||
                        txQuery.isFetching
                      }
                      onClick={() => setTxPage((p) => p + 1)}
                      className="inline-flex items-center gap-1 rounded-md border border-(--border) px-2 py-1.5 text-[12px] font-medium text-(--text-2) disabled:opacity-40"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" aria-hidden />
                    </button>
                  </div>
                ) : null}
              </>
            )}
          </div>
        </>
      ) : accountQuery.isPending ? (
        <div className="space-y-4">
          <div className="skeleton h-28 w-full rounded-xl" />
          <div className="skeleton h-40 w-full rounded-xl" />
        </div>
      ) : null}

      {showCancelConfirm ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.45)' }}
          role="presentation"
          onClick={() =>
            !cancelMutation.isPending ? setShowCancelConfirm(false) : undefined
          }
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="cancel-sub-heading"
            className="max-w-md rounded-xl border p-5 shadow-lg"
            style={{
              borderColor: 'var(--border)',
              background: 'var(--bg-raised)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <h3
              id="cancel-sub-heading"
              className="text-[15px] font-semibold text-foreground"
            >
              Cancel API Pro?
            </h3>
            <p className="mt-2 text-[13px] leading-relaxed text-(--text-2)">
              Paystack will stop charging this subscription. This app will move
              you to the Free API plan once cancellation succeeds.
            </p>
            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                disabled={cancelMutation.isPending}
                onClick={() => setShowCancelConfirm(false)}
                className="h-9 rounded-md border border-(--border) px-3 text-[12px] font-medium text-(--text-2) hover:bg-(--bg-subtle) disabled:opacity-50"
              >
                Keep plan
              </button>
              <button
                type="button"
                disabled={cancelMutation.isPending}
                onClick={() => cancelMutation.mutate()}
                className="inline-flex h-9 items-center gap-1.5 rounded-md border border-(--callout-warning-border) px-3 text-[12px] font-medium disabled:opacity-50"
                style={{
                  color: 'var(--callout-warning-fg)',
                  background: 'var(--callout-warning-bg)',
                }}
              >
                {cancelMutation.isPending ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden />
                ) : null}
                Confirm cancel
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
