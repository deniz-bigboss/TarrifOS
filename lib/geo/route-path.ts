import { greatCirclePoints, haversineKm, type LatLng } from "./great-circle";
import { projectToSvg } from "./country-centroids";

export interface Pt {
  x: number;
  y: number;
}

export interface RoutePath {
  /** One or more polylines (multiple when the route crosses the antimeridian). */
  polylines: Pt[][];
  /** Point on the route for placing the transport-mode badge. */
  midpoint: Pt;
}

/**
 * Turns a list of [lat,lng] waypoints into projected SVG polylines, sampling
 * each leg along its great circle for a smooth curve and splitting the line
 * wherever it crosses the ±180° antimeridian (so a trans-Pacific route wraps
 * around the map edges instead of streaking straight across it).
 */
export function buildRoutePath(
  waypoints: LatLng[],
  width: number,
  height: number,
): RoutePath {
  // Sample every leg; denser sampling for longer legs keeps curves smooth.
  const samples: LatLng[] = [];
  for (let i = 0; i < waypoints.length - 1; i++) {
    const a = waypoints[i];
    const b = waypoints[i + 1];
    const n = Math.max(4, Math.min(64, Math.round(haversineKm(a, b) / 250)));
    const pts = greatCirclePoints(a, b, n);
    // Drop the first point of every leg after the first to avoid duplicates.
    samples.push(...(i === 0 ? pts : pts.slice(1)));
  }

  const polylines: Pt[][] = [];
  let current: Pt[] = [];
  for (let i = 0; i < samples.length; i++) {
    const [lat, lng] = samples[i];
    const p = projectToSvg(lat, lng, width, height);
    if (current.length === 0) {
      current.push(p);
      continue;
    }
    const prev = current[current.length - 1];
    // A projected x-jump greater than half the map means the leg crossed the
    // antimeridian — finish this polyline at the edge and restart at the other.
    if (Math.abs(p.x - prev.x) > width / 2) {
      const prevLng = samples[i - 1][1];
      const goingEast = prevLng > 0; // prev near +180 → exits right edge
      const exitX = goingEast ? width : 0;
      const enterX = goingEast ? 0 : width;
      // Interpolate y at the crossing using wrapped distance.
      const wrappedPrev = goingEast ? prev.x : prev.x + width;
      const wrappedCur = goingEast ? p.x + width : p.x;
      const t = (wrappedPrev - (goingEast ? width : 0)) /
        (wrappedPrev - wrappedCur) || 0.5;
      const yCross = prev.y + t * (p.y - prev.y);
      current.push({ x: exitX, y: yCross });
      polylines.push(current);
      current = [{ x: enterX, y: yCross }, p];
    } else {
      current.push(p);
    }
  }
  if (current.length > 0) polylines.push(current);

  // Badge midpoint: middle vertex of the longest polyline segment.
  const longest = polylines.reduce(
    (best, pl) => (pl.length > best.length ? pl : best),
    polylines[0] ?? [],
  );
  const midpoint = longest.length
    ? longest[Math.floor(longest.length / 2)]
    : projectToSvg(waypoints[0][0], waypoints[0][1], width, height);

  return { polylines, midpoint };
}

/** Serializes a polyline to an SVG `points` attribute string. */
export function toPoints(pl: Pt[]): string {
  return pl.map((p) => `${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(" ");
}
