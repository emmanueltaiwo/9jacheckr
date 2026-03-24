import { ProductModel } from '../models/productModel.js';
import { isProductCacheStale } from '../constants/productCacheConstants.js';
import type { ExternalNafdacPayload, ProductPlain } from '../types/types.js';
import { logger } from '../utils/logger.js';
import { fetchProductFromNafdacRegistration } from '../utils/nafdacRegistrationClient.js';
import {
  isPlausibleNafdacCertificate,
  normalizeNafdac,
} from '../utils/nafdacFromOcrText.js';

function parseDate(value: string | null | undefined): Date | null {
  if (value == null || value === '') return null;
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
}

function mapExternalToPlain(
  fallbackCertificate: string,
  body: ExternalNafdacPayload,
): ProductPlain {
  const nafdac = normalizeNafdac(body.nafdac ?? fallbackCertificate);
  return {
    nafdac,
    name: body.name?.trim() || 'Unknown product',
    category: body.category?.trim() || '',
    source: body.source?.trim() || 'nafdac-registration',
    manufacturer: body.manufacturer?.trim() || '',
    approvedDate: parseDate(body.approvedDate ?? undefined),
    expiryDate: parseDate(body.expiryDate ?? undefined),
    ingredients: Array.isArray(body.ingredients)
      ? body.ingredients.map(String)
      : [],
  };
}

function toPlain(doc: {
  nafdac: string;
  name: string;
  category: string;
  source: string;
  manufacturer: string;
  approvedDate: Date | null;
  expiryDate: Date | null;
  ingredients: string[];
}): ProductPlain {
  return {
    nafdac: doc.nafdac,
    name: doc.name,
    category: doc.category,
    source: doc.source,
    manufacturer: doc.manufacturer,
    approvedDate: doc.approvedDate,
    expiryDate: doc.expiryDate,
    ingredients: doc.ingredients,
  };
}

function plainFromLean(existing: {
  nafdac: string;
  name: string;
  category: string;
  source: string;
  manufacturer: string;
  approvedDate: Date | null;
  expiryDate: Date | null;
  ingredients?: string[];
}): ProductPlain {
  return toPlain({
    nafdac: existing.nafdac,
    name: existing.name,
    category: existing.category,
    source: existing.source,
    manufacturer: existing.manufacturer,
    approvedDate: existing.approvedDate,
    expiryDate: existing.expiryDate,
    ingredients: existing.ingredients ?? [],
  });
}

async function persistPlainUpsert(plain: ProductPlain): Promise<ProductPlain> {
  const updated = await ProductModel.findOneAndUpdate(
    { nafdac: plain.nafdac },
    {
      $set: {
        nafdac: plain.nafdac,
        name: plain.name,
        category: plain.category,
        source: plain.source,
        manufacturer: plain.manufacturer,
        approvedDate: plain.approvedDate,
        expiryDate: plain.expiryDate,
        ingredients: plain.ingredients,
      },
    },
    {
      returnDocument: 'after',
      upsert: true,
      setDefaultsOnInsert: true,
    },
  ).lean();

  if (updated) {
    return plainFromLean(updated);
  }

  const fallback = await ProductModel.findOne({ nafdac: plain.nafdac }).lean();
  if (fallback) return plainFromLean(fallback);
  return plain;
}

export async function getOrFetchProduct(
  rawNafdac: string,
): Promise<ProductPlain | null> {
  const nafdac = normalizeNafdac(rawNafdac);
  if (!nafdac || !isPlausibleNafdacCertificate(rawNafdac)) return null;

  const existing = await ProductModel.findOne({ nafdac }).lean();

  if (existing && !isProductCacheStale(existing)) {
    logger.info('DB cache hit (fresh)', { nafdac });
    return plainFromLean(existing);
  }

  const certificateForPost = rawNafdac.trim();
  let external: ExternalNafdacPayload | null;

  try {
    if (existing) {
      logger.info('DB cache stale - revalidating from portal', { nafdac });
    } else {
      logger.info('DB cache miss - fetching from portal', {
        nafdac: certificateForPost,
      });
    }

    external = await fetchProductFromNafdacRegistration(certificateForPost);
  } catch (err) {
    if (existing) {
      logger.warn('NAFDAC revalidation failed; returning stale cache', {
        nafdac,
        message: String(err),
      });
      return plainFromLean(existing);
    }
    logger.error('NAFDAC registration lookup failed', {
      nafdac,
      message: String(err),
    });
    throw err;
  }

  if (!external) {
    if (existing) {
      await ProductModel.deleteOne({ nafdac });
      logger.info(
        'NAFDAC revalidation: product not on register — removed cached row',
        { nafdac },
      );
    }
    return null;
  }

  const plain = mapExternalToPlain(certificateForPost, external);

  try {
    return await persistPlainUpsert(plain);
  } catch (err) {
    const dup = await ProductModel.findOne({ nafdac: plain.nafdac }).lean();
    if (dup) {
      return plainFromLean(dup);
    }

    logger.error('Failed to save product', {
      nafdac,
      message: String(err),
    });
    throw err;
  }
}
