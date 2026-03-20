'use client';

import { useCallback, useEffect, useState } from 'react';
import { AlertCircle, RefreshCw, Trash2 } from 'lucide-react';
import { CopyFieldButton } from './copy-field-button';

type ApiKeyInfo = {
  keyPrefix: string;
  lastUsedAt: string | null;
  createdAt: string;
};
type MeJson = { ok: boolean; apiKey: ApiKeyInfo | null };
type CreateJson = { ok: boolean; rawKey: string; apiKey: ApiKeyInfo };
type RevokeJson = { ok: boolean; revokedAt: string | null };

export function ApiKeySection({ apiBaseUrl }: { apiBaseUrl: string }) {
  const base = apiBaseUrl.replace(/\/$/, '');
  const [info, setInfo] = useState<ApiKeyInfo | null | undefined>(undefined);
  const [rawKey, setRawKey] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!base) return;
    setMsg(null);
    const res = await fetch(`${base}/api/keys/me`, { credentials: 'include' });
    const data = (await res.json()) as MeJson;
    if (!res.ok) {
      setInfo(null);
      setMsg('Could not load key status.');
      return;
    }
    setInfo(data.apiKey);
  }, [base]);

  useEffect(() => {
    void load();
  }, [load]);

  async function createKey() {
    if (!base) return;
    setBusy(true);
    setMsg(null);
    setRawKey(null);
    try {
      const res = await fetch(`${base}/api/keys/create`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: '{}',
      });
      const data = (await res.json()) as CreateJson;
      if (!res.ok) {
        setMsg('Could not create or rotate key.');
        return;
      }
      setRawKey(data.rawKey);
      setInfo(data.apiKey);
    } finally {
      setBusy(false);
    }
  }

  async function revokeKey() {
    if (!base) return;
    setBusy(true);
    setMsg(null);
    setRawKey(null);
    try {
      const res = await fetch(`${base}/api/keys/me`, {
        method: 'DELETE',
        credentials: 'include',
      });
      const data = (await res.json()) as RevokeJson;
      if (!res.ok && res.status !== 404) {
        setMsg('Could not revoke key.');
        return;
      }
      setInfo(null);
      if (data.ok) void load();
    } finally {
      setBusy(false);
    }
  }

  if (info === undefined) {
    return (
      <div
        className="rounded-xl border"
        style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}
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
    );
  }

  const fmtDate = (iso: string) =>
    new Date(iso).toLocaleDateString('en-GB', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });

  return (
    <div
      className="rounded-xl border"
      style={{ borderColor: 'var(--border)', background: 'var(--bg-subtle)' }}
    >
      <div
        className="flex flex-wrap items-center justify-between gap-3 border-b px-5 py-4"
        style={{ borderColor: 'var(--border-subtle)' }}
      >
        <div>
          <h3 className="text-[14px] font-semibold text-[var(--text)]">
            {info ? 'Active key' : 'No API key'}
          </h3>
          <p className="mt-0.5 text-[12px]" style={{ color: 'var(--text-3)' }}>
            Passed as <code className="font-mono">x-api-key</code> on every
            request. One key per account.
          </p>
        </div>
        <div className="flex items-center gap-2">
          {info ? (
            <button
              type="button"
              disabled={busy}
              onClick={() => void revokeKey()}
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
            onClick={() => void createKey()}
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
              Copy your key — shown only once
            </p>
            <div
              className="flex items-center gap-2 rounded-lg border px-3 py-2.5"
              style={{
                borderColor: 'var(--border)',
                background: 'var(--bg-raised)',
              }}
            >
              <code className="flex-1 break-all font-mono text-[13px] text-[var(--text)]">
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
                  <span className="text-[var(--text)]">{info.keyPrefix}</span>
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
            <p className="text-[14px] font-medium text-[var(--text)]">
              No API key yet
            </p>
            <p className="mt-1 text-[13px]" style={{ color: 'var(--text-3)' }}>
              Click &ldquo;Create key&rdquo; above to generate one.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
