import { ApiKeySection } from '@/components/dashboard/api-key-section';

export default function KeysPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-[1.5rem] font-semibold tracking-[-0.03em] text-[var(--text)]">
          API Keys
        </h1>
        <p className="mt-1 text-[14px] text-[var(--text-2)]">
          Manage keys for authenticating requests to{' '}
          <code className="font-mono text-[13px] text-[var(--text-3)]">
            /api/verify
          </code>
          . You can hold one active key at a time.
        </p>
      </div>
      <ApiKeySection apiBaseUrl={apiBaseUrl} />
    </div>
  );
}
