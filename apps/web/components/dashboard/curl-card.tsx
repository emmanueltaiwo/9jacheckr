'use client';

import { CopyFieldButton } from './copy-field-button';

export function CurlCard({ apiBaseUrl }: { apiBaseUrl: string }) {
  const base = apiBaseUrl.replace(/\/$/, '');
  const url = base
    ? `${base}/api/verify/01-5713`
    : 'https://YOUR_API_HOST/api/verify/01-5713';
  const snippet = `curl -sS "${url}" \\\n  -H "x-api-key: YOUR_KEY_HERE"`;

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a08] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 px-4 py-3">
        <span className="font-mono text-xs text-stone-500">
          Example request
        </span>
        <CopyFieldButton text={snippet} label="Copy" />
      </div>
      <pre className="overflow-x-auto p-4 font-mono text-[13px] leading-relaxed text-stone-400">
        <code>{snippet}</code>
      </pre>
      <p className="border-t border-white/5 px-4 py-3 text-xs text-stone-600">
        Put your real key instead of{' '}
        <span className="font-mono text-stone-500">YOUR_KEY_HERE</span>. Header:{' '}
        <span className="font-mono text-stone-500">x-api-key</span>
      </p>
    </div>
  );
}
