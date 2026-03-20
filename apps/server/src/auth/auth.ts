import { betterAuth } from 'better-auth';
import { mongodbAdapter } from '@better-auth/mongo-adapter';
import { bearer } from 'better-auth/plugins';
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

  authInstance = betterAuth({
    baseURL:
      process.env.BETTER_AUTH_URL ??
      process.env.WEB_APP_URL ??
      'http://localhost:3000',
    secret: process.env.BETTER_AUTH_SECRET,
    trustedOrigins: [process.env.WEB_APP_URL || 'http://localhost:3000'],
    database: mongodbAdapter(db, { client }),
    plugins: [bearer()],
  });

  return authInstance;
}
