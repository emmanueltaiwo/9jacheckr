import { ProductModel } from '../models/productModel.js';

const MAX_QUERY_CHARS = 240;
const MAX_TOKENS = 16;

function escapeRegex(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Split user input into keywords (order ignored for matching). Min length 2 per token.
 */
export function tokenizeSearchQuery(raw: string): string[] {
  const s = raw.normalize('NFKC').trim().slice(0, MAX_QUERY_CHARS).toLowerCase();
  if (!s) return [];
  const segments = s.split(/[\s,;|/+]+/).filter(Boolean);
  const out: string[] = [];
  for (const seg of segments) {
    const t = seg.replace(/^[^\p{L}\p{N}-]+|[^\p{L}\p{N}-]+$/gu, '');
    if (t.length >= 2) out.push(t);
  }
  return [...new Set(out)].slice(0, MAX_TOKENS);
}

/**
 * MongoDB $text: quoted terms are AND (each term must appear somewhere in the indexed fields).
 * Unquoted multi-word is OR — we always normalize to explicit AND for multi-keyword queries.
 */
export function buildMongoTextSearchString(tokens: string[]): string {
  if (tokens.length === 0) return '';
  const esc = (u: string) => u.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  if (tokens.length === 1) return esc(tokens[0]!);
  return tokens.map((t) => `"${esc(t)}"`).join(' ');
}

type LeanHit = {
  nafdac: string;
  name: string;
  category: string;
  manufacturer: string;
};

/**
 * Extra path for NAFDAC-style fragments (hyphens/digits) where text tokenizer may split tokens.
 */
function nafdacSubstringRegex(raw: string): RegExp | null {
  const t = raw.normalize('NFKC').trim().slice(0, 32);
  if (t.length < 2) return null;
  if (!/[\d]/.test(t)) return null;
  if (!/^[\d\-A-Za-z]+$/i.test(t)) return null;
  return new RegExp(escapeRegex(t), 'i');
}

export async function runProductSearch(
  rawQuery: string,
  limit: number,
): Promise<LeanHit[]> {
  const tokens = tokenizeSearchQuery(rawQuery);
  if (tokens.length === 0) {
    return [];
  }

  const cap = Math.min(50, Math.max(1, limit));
  const trimmed = rawQuery.normalize('NFKC').trim();
  const seen = new Set<string>();
  const merged: LeanHit[] = [];

  if (trimmed.length >= 4 && trimmed.length <= 32 && /^[\w.-]+$/i.test(trimmed)) {
    const exact = await ProductModel.findOne({ nafdac: trimmed }).lean();
    if (exact) {
      seen.add(exact.nafdac);
      merged.push({
        nafdac: exact.nafdac,
        name: exact.name,
        category: exact.category ?? '',
        manufacturer: exact.manufacturer ?? '',
      });
      if (merged.length >= cap) return merged;
    }
  }

  const searchStr = buildMongoTextSearchString(tokens);
  const remainingAfterExact = cap - merged.length;
  if (remainingAfterExact <= 0) {
    return merged;
  }

  const textDocs = await ProductModel.find(
    { $text: { $search: searchStr } },
    {
      score: { $meta: 'textScore' },
      nafdac: 1,
      name: 1,
      category: 1,
      manufacturer: 1,
    },
  )
    .sort({ score: { $meta: 'textScore' } })
    .limit(remainingAfterExact)
    .lean();

  for (const d of textDocs) {
    if (seen.has(d.nafdac)) continue;
    seen.add(d.nafdac);
    merged.push({
      nafdac: d.nafdac,
      name: d.name,
      category: d.category ?? '',
      manufacturer: d.manufacturer ?? '',
    });
    if (merged.length >= cap) return merged;
  }

  if (merged.length < cap) {
    const rx = nafdacSubstringRegex(rawQuery);
    if (rx) {
      const need = cap - merged.length;
      const extra = await ProductModel.find(
        { nafdac: rx },
        { nafdac: 1, name: 1, category: 1, manufacturer: 1 },
      )
        .limit(Math.max(need * 3, need))
        .lean();

      for (const d of extra) {
        if (merged.length >= cap) break;
        if (seen.has(d.nafdac)) continue;
        seen.add(d.nafdac);
        merged.push({
          nafdac: d.nafdac,
          name: d.name,
          category: d.category ?? '',
          manufacturer: d.manufacturer ?? '',
        });
      }
    }
  }

  return merged;
}
