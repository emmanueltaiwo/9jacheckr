'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

type Tab = { id: string; label: string; body: string };

export function LandingCodeTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? '');

  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-[#080807] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.04)]">
      <div className="flex items-center gap-0 border-b border-white/10 bg-[#0a0a08] px-1">
        {tabs.map((tab) => {
          const isOn = tab.id === current?.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActive(tab.id)}
              className={cn(
                'relative px-4 py-3.5 font-mono text-xs font-medium uppercase tracking-[0.12em] transition',
                isOn ? 'text-[#dfff1f]' : 'text-stone-600 hover:text-stone-400',
              )}
            >
              {isOn ? (
                <span
                  className="absolute bottom-0 left-3 right-3 h-px bg-[#dfff1f]"
                  aria-hidden
                />
              ) : null}
              {tab.label}
            </button>
          );
        })}
        <span className="ml-auto hidden pr-3 font-mono text-[10px] text-stone-600 sm:block">
          read-only
        </span>
      </div>
      <pre className="overflow-x-auto p-5 font-mono text-[13px] leading-relaxed text-stone-400 sm:p-6 sm:text-[13.5px]">
        <code>{current?.body}</code>
      </pre>
    </div>
  );
}
