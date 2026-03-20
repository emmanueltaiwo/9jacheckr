const base = (process.env.NEXT_PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '');
export const API_BASE_URL = base;

export async function appApiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    cache: 'no-store',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error((data as { message?: string }).message ?? 'Request failed');
  return data as T;
}

export async function appApiPost<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'POST',
    credentials: 'include',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error((data as { message?: string }).message ?? 'Request failed');
  return data as T;
}

export async function appApiDelete<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    method: 'DELETE',
    credentials: 'include',
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error((data as { message?: string }).message ?? 'Request failed');
  return data as T;
}
