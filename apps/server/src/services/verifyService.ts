import { ProductModel } from '../models/productModel.js';
import type { ExternalNafdacPayload, ProductPlain } from '../types/types.js';
import { logger } from '../utils/logger.js';
import { fetchProductFromNafdacRegistration } from '../utils/nafdacRegistrationClient.js';

function normalizeNafdac(raw: string): string {
  const t = raw.trim().toUpperCase().replace(/\s+/g, '');
  if (!t) return '';
  if (t.includes('-')) return t;

  // (`015713` -> `01-5713`).
  if (/^\d+$/.test(t)) {
    if (t.length === 6) return `${t.slice(0, 2)}-${t.slice(2)}`;
    if (t.length === 7) return `${t.slice(0, 3)}-${t.slice(3)}`;
  }

  return t;
}

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

export async function getOrFetchProduct(
  rawNafdac: string,
): Promise<ProductPlain | null> {
  const nafdac = normalizeNafdac(rawNafdac);
  if (!nafdac) return null;

  const existing = await ProductModel.findOne({ nafdac }).lean();

  if (existing) {
    logger.info('DB cache hit', { nafdac });

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

  const certificateForPost = rawNafdac.trim();
  let external: ExternalNafdacPayload | null;

  try {
    logger.info('DB cache miss - fetching from portal', {
      nafdac: certificateForPost,
    });

    external = await fetchProductFromNafdacRegistration(certificateForPost);
  } catch (err) {
    logger.error('NAFDAC registration lookup failed', {
      nafdac,
      message: String(err),
    });
    throw err;
  }

  if (!external) return null;

  const plain = mapExternalToPlain(certificateForPost, external);

  try {
    const created = await ProductModel.create(plain);
    return toPlain(created);
  } catch (err) {
    const dup = await ProductModel.findOne({ nafdac: plain.nafdac }).lean();
    if (dup) {
      return toPlain({
        nafdac: dup.nafdac,
        name: dup.name,
        category: dup.category,
        source: dup.source,
        manufacturer: dup.manufacturer,
        approvedDate: dup.approvedDate,
        expiryDate: dup.expiryDate,
        ingredients: dup.ingredients ?? [],
      });
    }

    logger.error('Failed to save product', {
      nafdac,
      message: String(err),
    });
    throw err;
  }
}
