export function isNafdacUnavailable(): boolean {
  const v = process.env.NAFDAC_UNAVAILABLE?.trim().toLowerCase();
  return v === '1' || v === 'true' || v === 'yes';
}

export const NAFDAC_UNAVAILABLE_REPLY = [
  '<b>Verification temporarily unavailable</b>',
  '',
  "NAFDAC's public site has changed (e.g. captcha). We can't complete lookups until we ship an update.",
  '',
  'Please try again later — we’ll announce when it’s back.',
].join('\n');
