import { betterAuth } from 'better-auth';
import { mongodbAdapter } from '@better-auth/mongo-adapter';
import { getMongoClient } from '../utils/mongoNative.js';

let authInstance: unknown = null;

const cookieDomain = process.env.AUTH_COOKIE_DOMAIN?.trim();

export async function getAuth(): Promise<unknown> {
  if (authInstance) return authInstance;

  const uri = process.env.MONGODB_URI ?? '';
  if (!uri) throw new Error('MONGODB_URI is required');
  if (!process.env.BETTER_AUTH_SECRET) {
    throw new Error('BETTER_AUTH_SECRET is required');
  }

  const baseURL =
    process.env.BETTER_AUTH_URL?.replace(/\/$/, '') ??
    process.env.WEB_APP_URL?.replace(/\/$/, '') ??
    'http://localhost:4000';

  const webOrigin =
    process.env.WEB_APP_URL?.replace(/\/$/, '') ?? 'http://localhost:3000';

  const client = await getMongoClient(uri);
  const db = client.db();

  const googleId = process.env.GOOGLE_CLIENT_ID ?? '';
  const googleSecret = process.env.GOOGLE_CLIENT_SECRET ?? '';

  authInstance = betterAuth({
    baseURL,
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: [webOrigin],
    ...(cookieDomain
      ? {
          advanced: {
            crossSubDomainCookies: {
              enabled: true,
              domain: cookieDomain,
            },
          },
        }
      : {}),
    database: mongodbAdapter(db, { client }),
    ...(googleId && googleSecret
      ? {
          socialProviders: {
            google: {
              clientId: googleId,
              clientSecret: googleSecret,
              async profile(profile: {
                id?: unknown;
                sub?: unknown;
                email?: unknown;
                emails?: Array<{ value?: unknown }>;
                emailAddress?: unknown;
                name?: unknown;
                picture?: unknown;
              }) {
                const id = String(profile.id ?? profile.sub);
                const emailCandidate =
                  (typeof profile.email === 'string'
                    ? profile.email
                    : undefined) ??
                  (Array.isArray(profile.emails) &&
                  typeof profile.emails[0]?.value === 'string'
                    ? profile.emails[0].value
                    : undefined) ??
                  (typeof profile.emailAddress === 'string'
                    ? profile.emailAddress
                    : undefined);

                const email = emailCandidate ?? `${id}@google.local`;
                const name =
                  typeof profile.name === 'string' ? profile.name : undefined;
                const image =
                  typeof profile.picture === 'string'
                    ? profile.picture
                    : undefined;

                return { id, email, name, image };
              },
            },
          },
        }
      : {}),
  });

  return authInstance;
}
