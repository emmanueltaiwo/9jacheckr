import { Suspense } from 'react';
import { SettingsPageClient } from '@/components/dashboard/settings-page-client';

function SettingsFallback() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-8 w-48 rounded-md" />
      <div className="skeleton h-28 w-full rounded-xl" />
      <div className="skeleton h-48 w-full rounded-xl" />
    </div>
  );
}

export default function DashboardSettingsPage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
  return (
    <Suspense fallback={<SettingsFallback />}>
      <SettingsPageClient apiBaseUrl={apiBaseUrl} />
    </Suspense>
  );
}
