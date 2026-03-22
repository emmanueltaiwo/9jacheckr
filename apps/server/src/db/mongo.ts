import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';
import { ApiBillingPaymentModel } from '../models/apiBillingPaymentModel.js';
import { ApiKeyModel } from '../models/apiKeyModel.js';
import { ProductModel } from '../models/productModel.js';

async function fixProductTextIndexes(): Promise<void> {
  try {
    const indexes = await ProductModel.collection.indexes();
    for (const spec of indexes) {
      if (spec.name === '_id_') continue;
      const keys = spec.key as Record<string, string | number>;
      const isText = Object.values(keys).some((v) => v === 'text');
      if (isText && spec.name !== 'product_fulltext_v2') {
        await ProductModel.collection.dropIndex(spec.name as string);
        logger.info('Dropped legacy product text index', { name: spec.name });
      }
    }
  } catch (e) {
    const msg = String(e);
    if (!/ns not found|collection not found/i.test(msg)) {
      logger.warn('fixProductTextIndexes drop phase', { message: msg });
    }
  }
  try {
    await ProductModel.syncIndexes();
  } catch (e) {
    logger.warn('ProductModel.syncIndexes failed', { message: String(e) });
  }
}

async function fixApiKeyIndexes(): Promise<void> {
  try {
    await ApiKeyModel.collection.dropIndex('userId_1');
    logger.info('Dropped legacy unique index apikeys.userId_1 (multi-key support)');
  } catch (e) {
    const code = (e as { code?: number }).code;
    const msg = String(e);
    if (code !== 27 && !/index not found|ns not found/i.test(msg)) {
      logger.warn('Could not drop legacy apikeys.userId_1', { message: msg });
    }
  }
  try {
    await ApiKeyModel.syncIndexes();
  } catch (e) {
    logger.warn('ApiKeyModel.syncIndexes failed', { message: String(e) });
  }
  try {
    await ApiBillingPaymentModel.syncIndexes();
  } catch (e) {
    logger.warn('ApiBillingPaymentModel.syncIndexes failed', {
      message: String(e),
    });
  }
}

export async function connectMongo(): Promise<void> {
  const uri = process.env.MONGODB_URI?.trim();
  if (!uri) {
    throw new Error('MONGODB_URI is required');
  }

  const dbName = process.env.MONGODB_DB_NAME?.trim();

  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, { dbName });

  logger.info('MongoDB connected', { dbName });

  await fixApiKeyIndexes();
  await fixProductTextIndexes();
}

export async function disconnectMongo(): Promise<void> {
  await mongoose.disconnect();
  logger.info('MongoDB disconnected');
}
