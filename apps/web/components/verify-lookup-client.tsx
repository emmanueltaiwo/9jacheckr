'use client';

import { useId, useRef, useState } from 'react';
import { ArrowRight, Loader2, Search } from 'lucide-react';
import { useVerifyLookup } from '@/hooks/use-verify-lookup';
import {
  ProductResultView,
  VerifyErrorBanner,
} from '@/components/verify-product-result';

/** Format examples only — not a guarantee each number exists in the register */
const EXAMPLES = ['01-5713', 'A1-5645', '04-8122'];

export function VerifyLookupClient() {
  const formId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');
  const { loading, product, errorMessage, lookup } = useVerifyLookup();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await lookup(value.trim());
  }

  return (
    <div className="min-w-0 space-y-8">
      <form id={formId} onSubmit={(e) => void onSubmit(e)}>
        <label htmlFor={`${formId}-input`} className="sr-only">
          NAFDAC registration number
        </label>

        <div
          className="flex items-center gap-2 rounded-2xl p-2"
          style={{
            background: 'var(--bg-raised)',
            border: '1px solid var(--border)',
            boxShadow:
              '0 0 0 4px rgba(223,255,31,0.06), 0 4px 6px -1px rgba(0,0,0,0.4), 0 24px 64px -20px rgba(223,255,31,0.12)',
          }}
        >
          <div className="flex min-w-0 flex-1 items-center gap-3 px-3">
            <Search
              className="h-4.5 w-4.5 shrink-0"
              strokeWidth={1.75}
              style={{ color: 'var(--accent)' }}
              aria-hidden
            />
            <input
              ref={inputRef}
              id={`${formId}-input`}
              type="text"
              inputMode="text"
              autoComplete="off"
              spellCheck={false}
              placeholder="e.g. 01-5713"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              disabled={loading}
              autoFocus
              className="min-w-0 flex-1 bg-transparent py-3.5 font-mono text-[17px] text-foreground outline-none placeholder:text-(--text-3) disabled:opacity-50 sm:text-[18px]"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !value.trim()}
            className="flex h-13 shrink-0 items-center gap-2 rounded-xl px-6 text-[14px] font-bold uppercase tracking-[0.06em] text-black transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:px-8"
            style={{ background: 'var(--accent)' }}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden />
            ) : (
              <>
                <span className="hidden sm:inline">Verify</span>
                <ArrowRight className="h-4 w-4" aria-hidden />
              </>
            )}
          </button>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-x-1.5 gap-y-2">
          <span className="text-[12px]" style={{ color: 'var(--text-3)' }}>
            Try:
          </span>
          {EXAMPLES.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => {
                setValue(code);
                inputRef.current?.focus();
              }}
              className="rounded-md px-2 py-0.5 font-mono text-[11px] transition-colors hover:bg-(--nav-hover-bg)"
              style={{
                color: 'var(--text-3)',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {code}
            </button>
          ))}
        </div>
      </form>

      {errorMessage ? <VerifyErrorBanner message={errorMessage} /> : null}
      {product ? <ProductResultView product={product} /> : null}
    </div>
  );
}
