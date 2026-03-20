import { createAuthClient } from 'better-auth/react';

const baseURL = (
  process.env.NEXT_PUBLIC_BETTER_AUTH_URL ??
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  ''
).replace(/\/$/, '');

export const authClient = createAuthClient(baseURL ? { baseURL } : {});
