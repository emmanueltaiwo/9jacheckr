'use client';

import { Check, ChevronDown, Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

const OPTIONS = [
  { value: 'light' as const, label: 'Light', Icon: Sun },
  { value: 'dark' as const, label: 'Dark', Icon: Moon },
  { value: 'system' as const, label: 'System', Icon: Monitor },
];

/** ~min-w-[10rem]; keep in sync with dropdown class */
const MENU_MIN_WIDTH = 160;
const VIEWPORT_MARGIN = 8;

function pickMenuAlign(trigger: DOMRect): 'left' | 'right' {
  const vw =
    typeof window !== 'undefined' ? window.innerWidth : trigger.width + 200;
  const spaceIfRightAligned = trigger.right - MENU_MIN_WIDTH;
  const spaceIfLeftAligned = vw - trigger.left - MENU_MIN_WIDTH;

  const fitsRightAligned = spaceIfRightAligned >= VIEWPORT_MARGIN;
  const fitsLeftAligned = spaceIfLeftAligned >= VIEWPORT_MARGIN;

  if (fitsRightAligned && !fitsLeftAligned) return 'right';
  if (fitsLeftAligned && !fitsRightAligned) return 'left';
  if (!fitsRightAligned && !fitsLeftAligned) {
    return trigger.left + trigger.width / 2 < vw / 2 ? 'left' : 'right';
  }
  return 'right';
}

export function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuAlign, setMenuAlign] = useState<'left' | 'right'>('right');
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, []);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false);
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useLayoutEffect(() => {
    if (!open || !triggerRef.current) return;
    function updateAlign() {
      const el = triggerRef.current;
      if (!el) return;
      setMenuAlign(pickMenuAlign(el.getBoundingClientRect()));
    }
    updateAlign();
    window.addEventListener('resize', updateAlign);
    return () => window.removeEventListener('resize', updateAlign);
  }, [open]);

  if (!mounted) {
    return (
      <div
        className={cn(
          'h-8 w-[4.25rem] shrink-0 rounded-md border',
          className,
        )}
        style={{
          borderColor: 'var(--border-subtle)',
          background: 'var(--bg-subtle)',
        }}
        aria-hidden
      />
    );
  }

  const resolved = theme ?? 'system';
  const TriggerIcon =
    resolved === 'system' ? Monitor : resolved === 'dark' ? Moon : Sun;

  return (
    <div className={cn('relative', className)} ref={ref}>
      <button
        ref={triggerRef}
        type="button"
        onClick={(e) => {
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="inline-flex h-8 items-center gap-1 rounded-md border px-2 text-(--text-2) transition-colors hover:bg-(--nav-hover-bg) hover:text-foreground focus-visible-ring"
        style={{ borderColor: 'var(--border-subtle)' }}
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label="Color theme"
      >
        <TriggerIcon className="h-4 w-4" strokeWidth={1.75} />
        <ChevronDown className="h-3.5 w-3.5 opacity-60" aria-hidden />
      </button>
      {open ? (
        <div
          role="listbox"
          aria-label="Theme"
          className={cn(
            'absolute z-[100] mt-1 min-w-[10rem] rounded-lg border py-1',
            menuAlign === 'right' ? 'right-0' : 'left-0',
          )}
          style={{
            borderColor: 'var(--border)',
            background: 'var(--bg-raised)',
            boxShadow: 'var(--dropdown-shadow)',
          }}
        >
          {OPTIONS.map(({ value, label, Icon }) => {
            const selected = resolved === value;
            return (
              <button
                key={value}
                type="button"
                role="option"
                aria-selected={selected}
                onClick={() => {
                  setTheme(value);
                  setOpen(false);
                }}
                className="flex w-full items-center gap-2 px-3 py-2 text-left text-[13px] text-foreground transition-colors hover:bg-(--nav-hover-bg)"
              >
                <Icon
                  className="h-4 w-4 shrink-0 text-(--text-2)"
                  strokeWidth={1.75}
                />
                {label}
                {selected ? (
                  <Check
                    className="ml-auto h-4 w-4 shrink-0"
                    style={{ color: 'var(--accent)' }}
                    strokeWidth={2.5}
                  />
                ) : null}
              </button>
            );
          })}
        </div>
      ) : null}
    </div>
  );
}
