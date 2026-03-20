'use client';

import { CheckCircle2, Copy } from 'lucide-react';
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
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/5 px-3 py-1.5 font-mono text-xs text-stone-400 transition hover:border-white/25 hover:bg-white/10 hover:text-stone-200"
    >
      {done ? (
        <CheckCircle2 className="h-3.5 w-3.5 text-[#dfff1f]" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {done ? 'Copied' : label}
    </button>
  );
}
