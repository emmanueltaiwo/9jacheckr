import { betterAuth } from 'better-auth';
import { mongodbAdapter } from '@better-auth/mongo-adapter';
import { getMongoClient } from '../utils/mongoNative.js';

// Structural type for the parts of the auth instance we actually use.
export type AppAuth = {
  handler: (req: Request) => Promise<Response>;
  api: {
    getSession(o: { headers: Headers }): Promise<{
      user: { id: string; email: string; name: string; image?: string | null };
    } | null>;
  };
};

let _auth: AppAuth | null = null;

export async function getAuth(): Promise<AppAuth> {
  if (_auth) return _auth;

  const client = await getMongoClient(process.env.MONGODB_URI!);

  _auth = betterAuth({
    baseURL: process.env.BETTER_AUTH_URL!,
    secret: process.env.BETTER_AUTH_SECRET!,
    trustedOrigins: [process.env.WEB_APP_URL!],
    database: mongodbAdapter(client.db(), { client }),
    // Only set cross-subdomain cookie domain in production (when AUTH_COOKIE_DOMAIN is set).
    // In dev, Better Auth's default host-only cookie works fine for localhost.
    ...(process.env.AUTH_COOKIE_DOMAIN && {
      advanced: {
        crossSubDomainCookies: {
          enabled: true,
          domain: process.env.AUTH_COOKIE_DOMAIN,
        },
      },
    }),
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID!,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      },
    },
  }) as unknown as AppAuth;

  return _auth;
}
