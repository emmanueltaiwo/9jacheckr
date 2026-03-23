'use client';

import { useEffect, useRef, useState } from 'react';
import Script from 'next/script';
import { ChevronDown, ChevronUp } from 'lucide-react';

declare global {
  interface Window {
    twttr?: {
      widgets: {
        load: (el?: HTMLElement) => void;
      };
    };
  }
}

const TWEET_URLS = [
  'https://x.com/ez0xai/status/2036033746860700040',
  'https://x.com/ez0xai/status/2035428537075744911',
  'https://x.com/sammon_og/status/2035771631281328610?s=20',
  'https://x.com/Investor_mercy/status/2035758012850164152?s=20',
  'https://x.com/Mic_Timz/status/2035719267572736039?s=20',
  'https://x.com/n0tdapo/status/2035717455843074151?s=20',
  'https://x.com/Emmanuel_extra/status/2035705234211659851?s=20',
  'https://x.com/Builtbysammy/status/2035706346901750001?s=20',
  'https://x.com/SavvyRinu/status/2035568544558002361?s=20',
  'https://x.com/2dayinghistory/status/2035841571778855413?s=20',
  'https://x.com/LuffyTheNinja/status/2035808244162056559?s=20',
  'https://x.com/SokeyeA/status/2035768447234113642?s=20',
] as const;

function extractId(url: string) {
  return url.match(/status\/(\d+)/)?.[1] ?? null;
}

function extractHandle(url: string) {
  return url.match(/x\.com\/([^/]+)\//)?.[1] ?? null;
}

function TweetEmbed({ url }: { url: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const id = extractId(url);
  const handle = extractHandle(url);

  useEffect(() => {
    if (!containerRef.current) return;
    if (window.twttr?.widgets) {
      window.twttr.widgets.load(containerRef.current);
    }
  }, [url]);

  if (!id) return null;

  return (
    <div ref={containerRef} className="tweet-embed-container min-h-[200px]">
      <blockquote
        className="twitter-tweet"
        data-theme="dark"
        data-dnt="true"
        data-conversation="none"
      >
        <a href={`https://twitter.com/${handle ?? 'x'}/status/${id}`}>
          View tweet
        </a>
      </blockquote>
    </div>
  );
}

const INITIAL_VISIBLE = 3;

export function TweetWall() {
  const [expanded, setExpanded] = useState(false);
  const hasMore = TWEET_URLS.length > INITIAL_VISIBLE;
  const visibleUrls = expanded
    ? TWEET_URLS
    : TWEET_URLS.slice(0, INITIAL_VISIBLE);

  useEffect(() => {
    if (!expanded || !hasMore) return;
    const id = window.setTimeout(() => {
      window.twttr?.widgets?.load();
    }, 150);
    return () => window.clearTimeout(id);
  }, [expanded, hasMore]);

  return (
    <>
      <Script
        src="https://platform.twitter.com/widgets.js"
        strategy="lazyOnload"
        onLoad={() => {
          window.twttr?.widgets.load();
        }}
      />
      <div className="columns-1 gap-5 sm:columns-2 lg:columns-3">
        {visibleUrls.map((url) => (
          <div key={url} className="mb-5 break-inside-avoid">
            <TweetEmbed url={url} />
          </div>
        ))}
      </div>
      {hasMore ? (
        <div className="mt-2 flex justify-center">
          {expanded ? (
            <button
              type="button"
              onClick={() => setExpanded(false)}
              className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-[13px] font-medium transition-colors hover:bg-(--nav-hover-bg) focus-visible-ring"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text-2)',
              }}
            >
              <ChevronUp className="h-4 w-4 shrink-0" aria-hidden />
              Collapse
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setExpanded(true)}
              className="inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-[13px] font-medium transition-colors hover:bg-(--nav-hover-bg) focus-visible-ring"
              style={{
                borderColor: 'var(--border)',
                color: 'var(--text-2)',
              }}
            >
              Show all ({TWEET_URLS.length})
              <ChevronDown className="h-4 w-4 shrink-0" aria-hidden />
            </button>
          )}
        </div>
      ) : null}
    </>
  );
}
