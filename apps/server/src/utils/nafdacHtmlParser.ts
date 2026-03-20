import * as cheerio from 'cheerio';
import type { ExternalNafdacPayload } from '../types/types.js';

const LABEL_MAP: Record<
  string,
  keyof ExternalNafdacPayload | 'ingredientText'
> = {
  'Product Name': 'name',
  'Product Category': 'category',
  'Product Source': 'source',
  Manufacturer: 'manufacturer',
  'Date Approved': 'approvedDate',
  'Expiry Date': 'expiryDate',
  'NAFDAC No': 'nafdac',
  'Active Ingredient': 'ingredientText',
};

function splitIngredients(text: string): string[] {
  return text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

export function parseNafdacVerifyModalHtml(
  html: string,
): ExternalNafdacPayload | null {
  const $ = cheerio.load(html);
  const modal = $('#modalCenter');
  if (!modal.length) return null;

  if (modal.find('.alert-danger').length) return null;
  if (!modal.find('.alert-success').length) return null;

  const body = modal.find('.modal-body');
  if (!body.length) return null;

  const out: ExternalNafdacPayload = {};
  let ingredientLine: string | undefined;

  const alertText = modal.find('.alert-success').first().text().trim();
  const alertName = alertText
    .match(/Success,\s*Product found,\s*(.+)/i)?.[1]
    ?.trim();

  body.find('table tr td span').each((_, el) => {
    const text = $(el).text().trim();
    const m = text.match(/^([^:]+):\s*(.*)$/);
    if (!m) return;

    const label = m[1].trim();
    const value = m[2].trim();

    const key = LABEL_MAP[label];

    if (!key) return;

    if (key === 'ingredientText') {
      ingredientLine = value;
      return;
    }

    (out as Record<string, string | undefined>)[key] = value;
  });

  if (!out.name && alertName) out.name = alertName;

  if (!out.name && !out.nafdac) return null;

  if (ingredientLine) {
    out.ingredients = splitIngredients(ingredientLine);
  }

  out.approved = true;
  return out;
}
