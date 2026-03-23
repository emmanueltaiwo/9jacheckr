import type { Metadata } from 'next';
import { SiteNav } from '@/components/site-nav';
import { DocsContent } from '@/components/docs-content';

export const metadata: Metadata = {
  title: 'API Reference · 9ja Checkr',
  description:
    'Complete API documentation for the 9ja Checkr NAFDAC lookup API. Free and Pro tier reference, authentication, endpoints, rate limits, and code examples.',
};

export default function DocsPage() {
  return (
    <div
      className="min-h-dvh w-full"
      style={{ background: 'var(--bg)', color: 'var(--text)' }}
    >
      <SiteNav />
      <DocsContent />
    </div>
  );
}
