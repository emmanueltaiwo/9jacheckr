import { HomePageClient } from '@/components/dashboard/home-page-client';

export default function DashboardHomePage() {
  const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
  return <HomePageClient apiBaseUrl={apiBaseUrl} />;
}
