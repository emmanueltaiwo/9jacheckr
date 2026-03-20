import { headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import { auth } from '@/lib/auth';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth.api.getSession({ headers: await headers() });

  if (!session?.user) {
    redirect('/login');
  }

  const email = session.user.email ?? 'Account';
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

  return (
    <DashboardShell email={email} apiBaseUrl={apiBaseUrl}>
      {children}
    </DashboardShell>
  );
}
