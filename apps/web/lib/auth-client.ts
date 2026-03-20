import { createAuthClient } from 'better-auth/react';

/** Same origin as `BETTER_AUTH_URL` but exposed to the browser (non-NEXT_PUBLIC vars are not). */
const baseURL = process.env.NEXT_PUBLIC_BETTER_AUTH_URL;

export const authClient = createAuthClient(baseURL ? { baseURL } : undefined);
