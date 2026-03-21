'use client';

import { CopyFieldButton } from './copy-field-button';

export function CurlCard({ apiBaseUrl }: { apiBaseUrl: string }) {
  const base = apiBaseUrl.replace(/\/$/, '');
  const url = base
    ? `${base}/api/verify/01-5713`
    : 'https://api.9jacheckr.xyz/api/verify/01-5713';
  const snippet = `curl -sS "${url}" \\\n  -H "x-api-key: YOUR_KEY_HERE"`;

  return (
    <div className="code-surface">
      <div className="code-surface-header">
        <span
          className="font-mono text-[11px]"
          style={{ color: 'var(--text-3)' }}
        >
          GET /api/verify/:nafdac
        </span>
        <CopyFieldButton text={snippet} label="Copy" />
      </div>
      <div className="p-5">
        <pre
          className="overflow-x-auto font-mono text-[13px] leading-relaxed"
          style={{ color: 'var(--syn-str)' }}
        >
          <span style={{ color: 'var(--syn-punct)' }}>curl -sS </span>
          <span style={{ color: 'var(--syn-str)' }}>&quot;{url}&quot;</span>
          <span style={{ color: 'var(--syn-punct)' }}> \</span>
          {'\n'}
          <span style={{ color: 'var(--syn-punct)' }}>{'  '}-H </span>
          <span style={{ color: 'var(--syn-str)' }}>
            &quot;x-api-key: YOUR_KEY_HERE&quot;
          </span>
        </pre>
      </div>
      <div
        className="border-t px-5 py-3 text-[12px]"
        style={{ borderColor: 'var(--border-subtle)', color: 'var(--text-3)' }}
      >
        Replace{' '}
        <code className="font-mono" style={{ color: 'var(--text-2)' }}>
          YOUR_KEY_HERE
        </code>{' '}
        with your key from the API Keys page.
      </div>
    </div>
  );
}
