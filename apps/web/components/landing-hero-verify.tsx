'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ArrowRight, Loader2, Search, X } from 'lucide-react';
import { useVerifyLookup } from '@/hooks/use-verify-lookup';
import {
  ProductResultView,
  VerifyErrorBanner,
} from '@/components/verify-product-result';

/** Format examples only — not a guarantee each number exists in the register */
const EXAMPLES = ['01-5713', 'A1-5645', '04-8122'];

export function LandingHeroVerify() {
  const formId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [value, setValue] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const { loading, product, errorMessage, lookup, reset } = useVerifyLookup();

  useEffect(() => {
    if (loading) return;
    if (product || errorMessage) setModalOpen(true);
  }, [loading, product, errorMessage]);

  // Lock body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = modalOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [modalOpen]);

  // Close on Escape
  useEffect(() => {
    if (!modalOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeModal();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [modalOpen]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    await lookup(value.trim());
  }

  function closeModal() {
    setModalOpen(false);
    reset();
  }

  function tryExample(code: string) {
    setValue(code);
    inputRef.current?.focus();
  }

  return (
    <>
      <form onSubmit={(e) => void onSubmit(e)} className="w-full">
        <label htmlFor={`${formId}-input`} className="sr-only">
          NAFDAC registration number
        </label>

        <div
          className="relative mx-auto flex items-center gap-2 rounded-2xl p-2"
          style={{
            background: 'var(--bg-raised)',
            border: '1px solid var(--border)',
            boxShadow: `0 0 0 4px rgba(223,255,31,0.06), 0 4px 6px -1px rgba(0,0,0,0.4), 0 24px 64px -20px rgba(223,255,31,0.12)`,
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
              className="min-w-0 flex-1 bg-transparent py-3 text-[17px] text-foreground outline-none placeholder:text-(--text-3) disabled:opacity-50 sm:text-[18px]"
            />
          </div>
          <button
            type="submit"
            disabled={loading || !value.trim()}
            className="flex h-12 shrink-0 items-center gap-2 rounded-xl px-5 text-[14px] font-bold uppercase tracking-[0.06em] text-black transition-all hover:opacity-90 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 sm:px-7 sm:text-[15px]"
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

        <div className="mt-3.5 flex flex-wrap items-center justify-center gap-x-1.5 gap-y-2">
          <span className="text-[12px]" style={{ color: 'var(--text-3)' }}>
            Try:
          </span>
          {EXAMPLES.map((code) => (
            <button
              key={code}
              type="button"
              onClick={() => tryExample(code)}
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

      {/* Result modal — custom fixed overlay, no <dialog> quirks */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[500] flex items-end justify-center p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-label="Verification result"
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.72)' }}
            onClick={closeModal}
            aria-hidden
          />

          {/* Card */}
          <div
            className="verify-result-reveal relative z-10 flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl sm:max-h-[85dvh] sm:max-w-[540px] sm:rounded-2xl"
            style={{
              background: 'var(--bg-raised)',
              border: '1px solid var(--border)',
              boxShadow:
                '0 24px 80px -16px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.05)',
            }}
          >
            {/* Accent top line */}
            <div
              className="h-[2px] w-full shrink-0"
              style={{
                background:
                  'linear-gradient(90deg, transparent 0%, var(--accent) 40%, var(--accent) 60%, transparent 100%)',
              }}
              aria-hidden
            />

            {/* Header */}
            <div
              className="flex shrink-0 items-center justify-between px-5 py-3.5"
              style={{ borderBottom: '1px solid var(--border-subtle)' }}
            >
              <div className="flex items-center gap-2.5">
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ background: 'var(--accent)' }}
                  aria-hidden
                />
                <p className="text-[14px] font-semibold text-foreground">
                  Register result
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-(--text-2) transition-colors hover:bg-(--nav-hover-bg) hover:text-foreground focus-visible-ring"
                aria-label="Close"
              >
                <X className="h-4 w-4" strokeWidth={2.5} />
              </button>
            </div>

            {/* Content */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">
              {errorMessage ? (
                <VerifyErrorBanner message={errorMessage} />
              ) : null}
              {product ? (
                <ProductResultView product={product} showDevCta={false} />
              ) : null}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
