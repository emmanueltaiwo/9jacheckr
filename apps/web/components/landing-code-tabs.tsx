'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { CopyFieldButton } from '@/components/dashboard/copy-field-button';

type Tab = { id: string; label: string; body: string };

export function LandingCodeTabs({ tabs }: { tabs: Tab[] }) {
  const [active, setActive] = useState(tabs[0]?.id ?? '');
  const current = tabs.find((t) => t.id === active) ?? tabs[0];

  return (
    <div className="code-surface min-w-0 max-w-full">
      <div className="code-surface-header min-w-0 flex-wrap gap-y-2">
        <div className="flex min-w-0 flex-wrap items-center gap-0.5">
          {tabs.map((tab) => {
            const on = tab.id === current?.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActive(tab.id)}
                className={cn(
                  'rounded-md px-3 py-1.5 font-mono text-[12px] font-medium transition-colors',
                  on ? 'text-[var(--text)]' : 'hover:text-[var(--text-2)]',
                )}
                style={{
                  background: on ? 'var(--bg-overlay)' : 'transparent',
                  color: on ? 'var(--text)' : 'var(--text-3)',
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>
        {current ? (
          <div className="shrink-0">
            <CopyFieldButton text={current.body} label="Copy" />
          </div>
        ) : null}
      </div>
      <pre
        className="min-w-0 max-w-full overflow-x-auto p-5 font-mono text-[13px] leading-relaxed"
        style={{ color: 'var(--text-2)' }}
      >
        <code className="inline-block min-w-0 whitespace-pre">
          {current?.body}
        </code>
      </pre>
    </div>
  );
}
