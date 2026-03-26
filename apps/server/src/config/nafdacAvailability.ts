export function isNafdacUnavailable(): boolean {
  const v = process.env.NAFDAC_UNAVAILABLE?.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

export const NAFDAC_UNAVAILABLE_MESSAGE =
  'NAFDAC verification is temporarily unavailable while we adapt to upstream changes. Please try again later.';
