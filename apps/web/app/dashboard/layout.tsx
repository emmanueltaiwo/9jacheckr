import { DashboardAuthGate } from '@/components/dashboard/dashboard-auth-gate';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
  return (
    <DashboardAuthGate>
      <DashboardShell apiBaseUrl={apiBaseUrl}>{children}</DashboardShell>
    </DashboardAuthGate>
  );
}
