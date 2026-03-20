import { fetchAndStoreSessionBearer, getSessionBearer } from './session-bearer';

const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '');
export const API_BASE_URL = base;

async function ensureSessionBearer(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (getSessionBearer()) return;
  await fetchAndStoreSessionBearer();
}

function bearerHeaders(): HeadersInit {
  const t = getSessionBearer();
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function appApiGet<T>(path: string): Promise<T> {
  await ensureSessionBearer();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    cache: 'no-store',
    headers: bearerHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error((data as { message?: string }).message ?? 'Request failed');
  return data as T;
}

export async function appApiPost<T>(path: string): Promise<T> {
  await ensureSessionBearer();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...bearerHeaders(),
    },
    body: JSON.stringify({}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error((data as { message?: string }).message ?? 'Request failed');
  return data as T;
}

export async function appApiDelete<T>(path: string): Promise<T> {
  await ensureSessionBearer();
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    credentials: 'include',
    headers: bearerHeaders(),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error((data as { message?: string }).message ?? 'Request failed');
  return data as T;
}
