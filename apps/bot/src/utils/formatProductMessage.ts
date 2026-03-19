import type { ProductDto } from '../types/apiTypes.js';

function formatDate(value: string | null): string {
  if (!value) return '—';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? value : d.toISOString().slice(0, 10);
}

function expiryStatus(expiryDate: string | null): {
  line: string;
  warn: boolean;
} {
  if (!expiryDate) return { line: '', warn: false };
  const d = new Date(expiryDate);
  if (Number.isNaN(d.getTime())) return { line: '', warn: false };
  const now = new Date();
  const ms = d.getTime() - now.getTime();
  const days = Math.ceil(ms / (24 * 60 * 60 * 1000));
  if (days < 0)
    return {
      line: '⚠️ This registration appears expired. Do not use.',
      warn: true,
    };
  if (days <= 90)
    return {
      line: `⚠️ Expires in ${days} day(s). Check packaging.`,
      warn: true,
    };
  return { line: `Expires in ${days} day(s).`, warn: false };
}

export function formatVerifyReply(product: ProductDto): string {
  const exp = expiryStatus(product.expiryDate);
  const lines = [
    '<b>9ja Checkr — NAFDAC lookup</b>',
    '',
    `<b>Status:</b> Listed in registry (verify details on pack & NAFDAC channels).`,
    `<b>NAFDAC:</b> <code>${escapeHtml(product.nafdac)}</code>`,
    `<b>Name:</b> ${escapeHtml(product.name)}`,
    `<b>Category:</b> ${escapeHtml(product.category || '—')}`,
    `<b>Manufacturer:</b> ${escapeHtml(product.manufacturer || '—')}`,
    `<b>Approved:</b> ${formatDate(product.approvedDate)}`,
    `<b>Expiry:</b> ${formatDate(product.expiryDate)}`,
  ];
  if (product.ingredients.length) {
    lines.push(
      '',
      '<b>Ingredients:</b>',
      escapeHtml(product.ingredients.join(', ')),
    );
  }
  if (exp.line) lines.push('', exp.line);
  lines.push(
    '',
    '<i>Always confirm with your pharmacist. Forwarding helps others stay safe.</i>',
  );
  return lines.join('\n');
}

export function formatNotFoundMessage(nafdac: string): string {
  return [
    '<b>9ja Checkr</b>',
    '',
    `<b>Not approved / not found</b> for <code>${escapeHtml(nafdac)}</code>.`,
    '',
    'We could not match this number. It may be fake, mistyped, or not yet in our data source.',
    '',
    '<i>Do not consume if in doubt. Buy from licensed outlets only.</i>',
  ].join('\n');
}

export function formatErrorMessage(message: string): string {
  return ['<b>9ja Checkr</b>', '', escapeHtml(message)].join('\n');
}

function escapeHtml(s: string): string {
  return s
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}
