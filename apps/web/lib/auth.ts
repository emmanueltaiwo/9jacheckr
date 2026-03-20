import { headers } from 'next/headers';

function serverApiBase(): string {
  return (
    process.env.API_INTERNAL_BASE_URL ??
    process.env.NEXT_PUBLIC_API_BASE_URL ??
    'http://localhost:4000'
  ).replace(/\/$/, '');
}

export type ServerSessionUser = {
  id: string;
  email: string;
  name?: string;
  image?: string | null;
};

/**
 * Session lives on the API (Better Auth). Forwards the browser Cookie header
 * so shared-domain cookies work in production (www + api).
 */
export async function getServerSession(): Promise<{
  user: ServerSessionUser;
} | null> {
  const h = await headers();
  const cookie = h.get('cookie');
  const res = await fetch(`${serverApiBase()}/api/auth/get-session`, {
    headers: cookie ? { Cookie: cookie } : {},
    cache: 'no-store',
  });

  if (!res.ok) return null;

  const data = (await res.json()) as {
    user?: ServerSessionUser;
  } | null;

  if (!data?.user) return null;
  return { user: data.user };
}
