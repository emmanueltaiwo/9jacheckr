'use client';

import { CopyFieldButton } from '@/components/dashboard/copy-field-button';

function endpointRow(method: string, path: string, methodStyle: 'get' | 'post') {
  const isGet = methodStyle === 'get';
  return (
    <div
      className="mt-3 flex items-center gap-2 rounded-lg border px-3 py-2"
      style={{
        borderColor: 'var(--border-subtle)',
        background: 'var(--bg-raised)',
      }}
    >
      <span
        className="shrink-0 rounded px-1.5 py-0.5 font-mono text-[10px] font-bold"
        style={{
          background: isGet
            ? 'var(--get-badge-bg)'
            : 'rgba(96, 165, 250, 0.15)',
          color: isGet ? 'var(--get-badge-fg)' : '#93c5fd',
        }}
      >
        {method}
      </span>
      <code
        className="font-mono text-[12px] break-all"
        style={{ color: 'var(--text-2)' }}
      >
        {path}
      </code>
    </div>
  );
}

type Props = { apiBaseUrl: string };

export function ProApiEndpointsDocs({ apiBaseUrl }: Props) {
  const base = apiBaseUrl.replace(/\/$/, '');
  const sampleBase = base || 'https://api.9jacheckr.xyz';

  const batchCurl = `curl -sS -X POST "${sampleBase}/api/verify/batch" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: YOUR_KEY_HERE" \\
  -d '{"nafdac":["01-5713","04-8127"]}'`;

  const batchJson = `{
  "ok": true,
  "results": [
    {
      "nafdac": "01-5713",
      "ok": true,
      "product": {
        "nafdac": "01-5713",
        "name": "…",
        "category": "Food",
        "manufacturer": "…",
        "approvedDate": "…",
        "expiryDate": "…",
        "ingredients": ["…"]
      }
    },
    {
      "nafdac": "99-9999",
      "ok": false,
      "code": "NOT_FOUND",
      "message": "Product not found for this NAFDAC number"
    }
  ]
}`;

  const searchCurl = `curl -sS "${sampleBase}/api/products/search?q=sardine&limit=10" \\
  -H "x-api-key: YOUR_KEY_HERE"`;

  const searchJson = `{
  "ok": true,
  "results": [
    {
      "nafdac": "01-5713",
      "name": "TITUS SARDINE IN VEGETABLE OIL",
      "category": "Food",
      "manufacturer": "UNIMER S.A"
    }
  ]
}`;

  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-[14px] font-semibold text-foreground">
          Batch verify
        </h3>
        <p
          className="mt-1 text-[13px] leading-relaxed"
          style={{ color: 'var(--text-2)' }}
        >
          Verify up to 40 NAFDAC numbers in one request. Each successful or
          not-found result counts toward your monthly quota, same as single
          lookups.
        </p>
        {endpointRow('POST', '/api/verify/batch', 'post')}
        <div className="code-surface mt-4">
          <div className="code-surface-header">
            <span
              className="font-mono text-[11px]"
              style={{ color: 'var(--text-3)' }}
            >
              Request
            </span>
            <CopyFieldButton text={batchCurl} label="Copy" />
          </div>
          <div className="p-5">
            <pre
              className="overflow-x-auto whitespace-pre-wrap break-all font-mono text-[12px] leading-relaxed"
              style={{ color: 'var(--syn-str)' }}
            >
              {batchCurl}
            </pre>
          </div>
        </div>
        <div className="code-surface mt-3">
          <div className="code-surface-header">
            <span
              className="font-mono text-[11px]"
              style={{ color: 'var(--text-3)' }}
            >
              Response
            </span>
            <CopyFieldButton text={batchJson} label="Copy" />
          </div>
          <div className="p-5">
            <pre
              className="overflow-x-auto font-mono text-[12px] leading-relaxed"
              style={{ color: 'var(--syn-str)' }}
            >
              {batchJson}
            </pre>
          </div>
        </div>
      </div>

      <div>
        <h3 className="text-[14px] font-semibold text-foreground">
          Product search
        </h3>
        <p
          className="mt-1 text-[13px] leading-relaxed"
          style={{ color: 'var(--text-2)' }}
        >
          Searches NAFDAC, name, category, source, manufacturer, and each
          ingredient. Several words mean every word must match somewhere
          (order does not matter). Results are ranked by relevance. Query{' '}
          <code className="font-mono text-[12px] text-(--text-3)">q</code> must
          be at least 2 characters. Optional{' '}
          <code className="font-mono text-[12px] text-(--text-3)">limit</code>{' '}
          (1–50, default 20).
        </p>
        {endpointRow('GET', '/api/products/search?q=<query>&limit=<n>', 'get')}
        <div className="code-surface mt-4">
          <div className="code-surface-header">
            <span
              className="font-mono text-[11px]"
              style={{ color: 'var(--text-3)' }}
            >
              Request
            </span>
            <CopyFieldButton text={searchCurl} label="Copy" />
          </div>
          <div className="p-5">
            <pre
              className="overflow-x-auto whitespace-pre-wrap break-all font-mono text-[12px] leading-relaxed"
              style={{ color: 'var(--syn-str)' }}
            >
              {searchCurl}
            </pre>
          </div>
        </div>
        <div className="code-surface mt-3">
          <div className="code-surface-header">
            <span
              className="font-mono text-[11px]"
              style={{ color: 'var(--text-3)' }}
            >
              Response
            </span>
            <CopyFieldButton text={searchJson} label="Copy" />
          </div>
          <div className="p-5">
            <pre
              className="overflow-x-auto font-mono text-[12px] leading-relaxed"
              style={{ color: 'var(--syn-str)' }}
            >
              {searchJson}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
