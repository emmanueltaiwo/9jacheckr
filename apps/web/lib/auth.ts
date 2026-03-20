import { betterAuth } from 'better-auth';
import { mongodbAdapter } from '@better-auth/mongo-adapter';
import { getMongoClient } from './mongoNative';

export type AppAuth = NonNullable<ReturnType<typeof betterAuth>>;

let authPromise: Promise<AppAuth> | null = null;

/**
 * Lazy Better Auth instance so `next build` does not require MongoDB or env at
 * compile/bundle time. Fails at first request if `MONGODB_URI` / secrets are missing.
 */
export async function getAuth(): Promise<AppAuth> {
  authPromise ??= createAuth();
  return authPromise;
}

async function createAuth(): Promise<AppAuth> {
  const MONGODB_URI = process.env.MONGODB_URI ?? '';
  const BETTER_AUTH_URL = process.env.BETTER_AUTH_URL ?? 'http://localhost:3000';
  const BETTER_AUTH_SECRET = process.env.BETTER_AUTH_SECRET ?? '';

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is required for Better Auth');
  }
  if (!BETTER_AUTH_SECRET) {
    throw new Error('BETTER_AUTH_SECRET is required for Better Auth');
  }

  const mongoClient = await getMongoClient(MONGODB_URI);
  const db = mongoClient.db();

  const apiOrigin =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

  return betterAuth({
    baseURL: BETTER_AUTH_URL,
    secret: BETTER_AUTH_SECRET,
    trustedOrigins: [apiOrigin],
    database: mongodbAdapter(db, { client: mongoClient }),
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID ?? '',
        clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
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
            (typeof profile.email === 'string' ? profile.email : undefined) ??
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
            typeof profile.picture === 'string' ? profile.picture : undefined;

          return { id, email, name, image };
        },
      },
    },
  }) as unknown as AppAuth;
}
