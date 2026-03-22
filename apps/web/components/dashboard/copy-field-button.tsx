'use client';

import { Check, Copy } from 'lucide-react';
import { useState } from 'react';

export function CopyFieldButton({
  text,
  label = 'Copy',
}: {
  text: string;
  label?: string;
}) {
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      onClick={async () => {
        await navigator.clipboard.writeText(text);
        setDone(true);
        setTimeout(() => setDone(false), 2000);
      }}
      className="inline-flex h-7 items-center gap-1.5 rounded-md border px-2.5 font-mono text-[11px] transition-colors focus-visible-ring"
      style={{
        borderColor: 'var(--border)',
        background: 'var(--bg-overlay)',
        color: done ? 'var(--accent)' : 'var(--text-3)',
      }}
    >
      {done ? (
        <Check className="h-3 w-3" style={{ color: 'var(--accent)' }} />
      ) : (
        <Copy className="h-3 w-3" />
      )}
      {done ? 'Copied!' : label}
    </button>
  );
}
