export async function fetchApp<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(path, {
    credentials: 'include',
    ...init,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok)
    throw new Error((data as { message?: string }).message ?? 'Request failed');
  return data as T;
}

export async function appApiGet<T>(path: string): Promise<T> {
  return fetchApp<T>(path, { cache: 'no-store' });
}

export async function appApiPost<T>(path: string): Promise<T> {
  return fetchApp<T>(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({}),
  });
}

export async function appApiDelete<T>(path: string): Promise<T> {
  return fetchApp<T>(path, { method: 'DELETE' });
}
