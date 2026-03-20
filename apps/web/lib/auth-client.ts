import { createAuthClient } from 'better-auth/react';
import { SESSION_BEARER_STORAGE_KEY } from './session-bearer';

const baseURL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL;

const fetchOptions = {
  onSuccess(ctx: { response: Response }) {
    const t = ctx.response.headers.get('set-auth-token');
    if (typeof window !== 'undefined' && t) {
      localStorage.setItem(SESSION_BEARER_STORAGE_KEY, t);
    }
  },
  auth: {
    type: 'Bearer' as const,
    token: () =>
      typeof window !== 'undefined'
        ? localStorage.getItem(SESSION_BEARER_STORAGE_KEY) ?? ''
        : '',
  },
};

export const authClient = createAuthClient(
  baseURL ? { baseURL, fetchOptions } : { fetchOptions },
);
