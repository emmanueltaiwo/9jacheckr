import { betterAuth } from 'better-auth';
import { mongodbAdapter } from '@better-auth/mongo-adapter';
import mongoose from 'mongoose';
import { MongoClient } from 'mongodb';

let mongoClient: MongoClient | null = null;
let authInstance: ReturnType<typeof betterAuth> | null = null;

function requireEnv(name: string): string {
  const v = process.env[name]?.trim();
  if (!v) {
    throw new Error(`${name} is required`);
  }
  return v;
}

function webAppOrigin(): string {
  return process.env.WEB_APP_URL?.trim() || 'http://localhost:3000';
}

function publicApiBaseUrl(): string {
  const explicit = process.env.BETTER_AUTH_URL?.trim();
  if (explicit) return explicit.replace(/\/$/, '');
  const port = Number(process.env.PORT) || 4000;
  return `http://localhost:${port}`;
}

export async function getAuth(): Promise<ReturnType<typeof betterAuth>> {
  if (authInstance) {
    return authInstance;
  }

  const mongooseDb = mongoose.connection.db;
  if (!mongooseDb) {
    throw new Error('MongoDB must be connected before initializing auth');
  }

  const dbName = mongooseDb.databaseName;
  const uri = requireEnv('MONGODB_URI');

  mongoClient = new MongoClient(uri);
  await mongoClient.connect();
  const db = mongoClient.db(dbName);

  const baseURL = publicApiBaseUrl();
  const web = webAppOrigin().replace(/\/$/, '');
  const trusted = Array.from(new Set([web, baseURL]));

  const cookieDomain = process.env.AUTH_COOKIE_DOMAIN?.trim();

  const created = betterAuth({
    baseURL,
    secret: requireEnv('BETTER_AUTH_SECRET'),
    trustedOrigins: trusted,
    database: mongodbAdapter(db, {
      client: mongoClient,
      transaction: false,
    }),
    socialProviders: {
      google: {
        clientId: requireEnv('GOOGLE_CLIENT_ID'),
        clientSecret: requireEnv('GOOGLE_CLIENT_SECRET'),
      },
    },
    advanced: cookieDomain
      ? {
          crossSubDomainCookies: {
            enabled: true,
            domain: cookieDomain,
          },
        }
      : undefined,
    onAPIError: {
      errorURL: `${web}/login`,
    },
  });

  authInstance = created as ReturnType<typeof betterAuth>;
  return authInstance;
}

export async function closeAuthMongo(): Promise<void> {
  authInstance = null;
  if (mongoClient) {
    await mongoClient.close();
    mongoClient = null;
  }
}
