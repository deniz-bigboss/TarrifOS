/** Shared spherical-geometry helpers for the shipment-lane map. */

export type LatLng = [number, number];

const toRad = (d: number) => (d * Math.PI) / 180;
const toDeg = (r: number) => (r * 180) / Math.PI;

/** Great-circle distance in kilometers (haversine). */
export function haversineKm(a: LatLng, b: LatLng): number {
  const R = 6371;
  const dLat = toRad(b[0] - a[0]);
  const dLng = toRad(b[1] - a[1]);
  const lat1 = toRad(a[0]);
  const lat2 = toRad(b[0]);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * Samples `n` points (inclusive of both ends) along the great circle from a to
 * b via spherical linear interpolation. Longitudes come back in [-180, 180];
 * slerp always takes the shorter arc, so trans-Pacific pairs correctly cross
 * the antimeridian rather than sweeping the long way round.
 */
export function greatCirclePoints(a: LatLng, b: LatLng, n: number): LatLng[] {
  const φ1 = toRad(a[0]);
  const λ1 = toRad(a[1]);
  const φ2 = toRad(b[0]);
  const λ2 = toRad(b[1]);

  const A: [number, number, number] = [
    Math.cos(φ1) * Math.cos(λ1),
    Math.cos(φ1) * Math.sin(λ1),
    Math.sin(φ1),
  ];
  const B: [number, number, number] = [
    Math.cos(φ2) * Math.cos(λ2),
    Math.cos(φ2) * Math.sin(λ2),
    Math.sin(φ2),
  ];

  const dot = Math.max(-1, Math.min(1, A[0] * B[0] + A[1] * B[1] + A[2] * B[2]));
  const Ω = Math.acos(dot);
  if (Ω < 1e-6) return [a, b];

  const sinΩ = Math.sin(Ω);
  const pts: LatLng[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const s1 = Math.sin((1 - t) * Ω) / sinΩ;
    const s2 = Math.sin(t * Ω) / sinΩ;
    const x = s1 * A[0] + s2 * B[0];
    const y = s1 * A[1] + s2 * B[1];
    const z = s1 * A[2] + s2 * B[2];
    const lat = toDeg(Math.atan2(z, Math.hypot(x, y)));
    const lng = toDeg(Math.atan2(y, x));
    pts.push([lat, lng]);
  }
  return pts;
}
