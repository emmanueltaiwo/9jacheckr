import { headers } from 'next/headers';

export type SessionUser = {
  id: string;
  email: string;
  name?: string;
  image?: string | null;
};

const apiBase = () =>
  (process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000').replace(/\/$/, '');

/**
 * Read the session from the API server. Called only in Next.js server components.
 * Forwards the browser's Cookie header so the shared-domain session cookie is sent.
 */
export async function getServerSession(): Promise<{ user: SessionUser } | null> {
  const cookie = (await headers()).get('cookie');

  const res = await fetch(`${apiBase()}/api/auth/get-session`, {
    headers: { ...(cookie && { Cookie: cookie }) },
    cache: 'no-store',
  });

  if (!res.ok) return null;

  const data = (await res.json()) as { user?: SessionUser } | null;
  return data?.user ? { user: data.user } : null;
}
