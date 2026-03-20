export const SESSION_BEARER_STORAGE_KEY = '9jacheckr.sessionBearer';

export function getSessionBearer(): string {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(SESSION_BEARER_STORAGE_KEY) ?? '';
}

export function clearSessionBearer(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(SESSION_BEARER_STORAGE_KEY);
}

/** Reads httpOnly session from same-origin cookies and stores the token for API calls. */
export async function fetchAndStoreSessionBearer(): Promise<void> {
  if (typeof window === 'undefined') return;
  if (getSessionBearer()) return;
  try {
    const res = await fetch('/api/session-bearer', { credentials: 'include' });
    if (!res.ok) return;
    const data = (await res.json()) as { ok?: boolean; token?: string };
    if (data.ok && data.token) {
      localStorage.setItem(SESSION_BEARER_STORAGE_KEY, data.token);
    }
  } catch {
    /* ignore */
  }
}
