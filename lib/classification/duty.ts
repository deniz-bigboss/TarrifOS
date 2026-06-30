/**
 * Best-effort numeric duty estimate from a placeholder rate string like
 * "~12% (EU MFN, placeholder)". Returns null when no percentage is parseable.
 * This is explicitly a placeholder and always marked as such — never a
 * substitute for an official tariff source.
 */
export function estimateDutyValue(
  ratePlaceholder: string,
  declaredValue: number | null,
): number | null {
  if (declaredValue == null) return null;
  const match = ratePlaceholder.match(/(\d+(?:\.\d+)?)\s*%/);
  if (!match) return null;
  const pct = parseFloat(match[1]);
  if (Number.isNaN(pct)) return null;
  return Math.round(((declaredValue * pct) / 100) * 100) / 100;
}
