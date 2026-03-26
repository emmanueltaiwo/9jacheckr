export function isNafdacUnavailableClient(): boolean {
  const v =
    process.env.NAFDAC_UNAVAILABLE?.trim() ??
    process.env.NEXT_PUBLIC_NAFDAC_UNAVAILABLE?.trim();
  const l = v?.toLowerCase();
  return l === '1' || l === 'true' || l === 'yes';
}
