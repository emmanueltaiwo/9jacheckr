import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

export async function connectMongo(): Promise<void> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error('MONGODB_URI is required');
  }

  const dbName = process.env.MONGODB_DB_NAME?.trim();

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { dbName });

  logger.info('MongoDB connected', { dbName });
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}

export async function checkMongoHealth(): Promise<boolean> {
  if (mongoose.connection.readyState !== 1) return false;
  const db = mongoose.connection.db;
  if (!db) return false;
  try {
    await db.admin().command({ ping: 1 });
    return true;
  } catch {
    return false;
  }
}
