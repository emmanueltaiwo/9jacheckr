import { betterAuth } from 'better-auth';
import { mongodbAdapter } from '@better-auth/mongo-adapter';
import { getMongoClient } from '../utils/mongoNative.js';

let authInstance: unknown = null;

export async function getAuth() {
  if (authInstance) return authInstance;

  const uri = process.env.MONGODB_URI ?? '';
  if (!uri) throw new Error('MONGODB_URI is required');
  if (!process.env.BETTER_AUTH_SECRET) {
    throw new Error('BETTER_AUTH_SECRET is required');
  }

  const client = await getMongoClient(uri);
  const db = client.db();
  const mongoUseTransactions =
    process.env.BETTER_AUTH_MONGO_TRANSACTIONS === 'true';

  authInstance = betterAuth({
    baseURL:
      process.env.BETTER_AUTH_URL ??
      process.env.WEB_APP_URL ??
      'http://localhost:3000',
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: [process.env.WEB_APP_URL || 'http://localhost:3000'],
    database: mongodbAdapter(db, { client, transaction: mongoUseTransactions }),
    socialProviders: {
      google: {
        clientId: process.env.GOOGLE_CLIENT_ID as string,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
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
  });

  return authInstance;
}
