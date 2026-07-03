import { MapPin, Package, Plane, Ship, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { COUNTRY_CENTROIDS, projectToSvg } from "@/lib/geo/country-centroids";
import { LAND_PATHS, MAP_H, MAP_W, SEA_PATCHES } from "@/lib/geo/world-map";
import { seaRoute } from "@/lib/geo/sea-route";
import { buildRoutePath, toPoints, type Pt } from "@/lib/geo/route-path";
import type { LatLng } from "@/lib/geo/great-circle";
import { countryName } from "@/lib/utils";

/**
 * LaneMap — origin → destination trade-lane map for the shipment execution
 * plan. Pure server-rendered SVG (no client JS, no external tiles) over
 * simplified real-geography coastlines.
 *
 * Routing is realistic, not decorative: sea freight follows a maritime
 * waypoint network through the real chokepoints (Suez, Panama, Malacca,
 * Gibraltar, the Capes…), while air/courier follow the great circle. Both
 * wrap the antimeridian correctly, so a trans-Pacific lane crosses the
 * Pacific rather than streaking across Eurasia. Only the selected mode is
 * drawn; with no method chosen it shows the common air + sea options.
 */

interface ModeStyle {
  key: string;
  label: string;
  color: string;
  dash?: string;
  icon: LucideIcon;
  iconClass: string;
  borderClass: string;
  /** How this mode routes across the map. */
  routing: "sea" | "great-circle";
}

const MODES: Record<string, ModeStyle> = {
  air: {
    key: "air",
    label: "Air freight lane",
    color: "#38bdf8",
    dash: "8 7",
    icon: Plane,
    iconClass: "text-sky-300",
    borderClass: "border-sky-400/50",
    routing: "great-circle",
  },
  sea: {
    key: "sea",
    label: "Sea freight lane",
    color: "#22d3ee",
    icon: Ship,
    iconClass: "text-cyan-300",
    borderClass: "border-cyan-400/50",
    routing: "sea",
  },
  road: {
    key: "road",
    label: "Road freight lane",
    color: "#f59e0b",
    icon: Truck,
    iconClass: "text-amber-300",
    borderClass: "border-amber-400/50",
    routing: "great-circle",
  },
  courier: {
    key: "courier",
    label: "Courier / parcel (air network)",
    color: "#a78bfa",
    dash: "3 6",
    icon: Package,
    iconClass: "text-violet-300",
    borderClass: "border-violet-400/50",
    routing: "great-circle",
  },
};

interface LaneMapProps {
  origin: string;
  destination: string;
  /** The wizard's shipping method: sea | air | road | courier | null. */
  method?: string | null;
}

export function LaneMap({ origin, destination, method }: LaneMapProps) {
  const o = COUNTRY_CENTROIDS[(origin || "").toUpperCase()];
  const d = COUNTRY_CENTROIDS[(destination || "").toUpperCase()];
  if (!o || !d) return null;

  const originLL: LatLng = [o[0], o[1]];
  const destLL: LatLng = [d[0], d[1]];
  const from = projectToSvg(o[0], o[1], MAP_W, MAP_H);
  const to = projectToSvg(d[0], d[1], MAP_W, MAP_H);
  const domestic = origin.toUpperCase() === destination.toUpperCase();

  const selected = method ? MODES[method.toLowerCase()] : undefined;
  // No method chosen → show the two common international defaults.
  const lanes = selected ? [selected] : [MODES.air, MODES.sea];

  const laneGeometry = lanes.map((mode) => {
    const waypoints: LatLng[] =
      mode.routing === "sea"
        ? seaRoute(originLL, destLL) ?? [originLL, destLL]
        : [originLL, destLL];
    const { polylines, midpoint } = buildRoutePath(waypoints, MAP_W, MAP_H);
    return { mode, polylines, midpoint };
  });

  const labelAnchor = (x: number) =>
    x < 140 ? "start" : x > MAP_W - 140 ? "end" : "middle";

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-xs font-semibold uppercase text-slate-400">
          Trade lane
        </p>
        <p className="text-sm font-medium text-slate-200">
          {countryName(origin)} → {countryName(destination)}
        </p>
      </div>

      <div className="relative mt-4 overflow-hidden rounded-md border border-white/10 bg-slate-950">
        <svg
          viewBox={`0 0 ${MAP_W} ${MAP_H}`}
          className="block h-auto w-full"
          role="img"
          aria-label={`Illustrative trade lane from ${countryName(origin)} to ${countryName(destination)}`}
        >
          {/* graticule */}
          <g stroke="#1e293b" strokeWidth="1" opacity="0.5">
            {[100, 200, 300, 400].map((y) => (
              <line key={`h${y}`} x1="0" y1={y} x2={MAP_W} y2={y} />
            ))}
            {[167, 333, 500, 667, 833].map((x) => (
              <line key={`v${x}`} x1={x} y1="0" x2={x} y2={MAP_H} />
            ))}
          </g>

          {/* landmasses */}
          <g fill="#2b394e" stroke="#3d4f68" strokeWidth="1" strokeLinejoin="round">
            {LAND_PATHS.map((path, i) => (
              <path key={i} d={path} />
            ))}
          </g>
          {/* inland seas punched back out of the land */}
          <g fill="#020617">
            {SEA_PATCHES.map((path, i) => (
              <path key={i} d={path} />
            ))}
          </g>

          {/* selected transport lane(s) — one polyline per antimeridian span */}
          {!domestic &&
            laneGeometry.map(({ mode, polylines }) =>
              polylines.map((pl, i) => (
                <polyline
                  key={`${mode.key}-${i}`}
                  points={toPoints(pl)}
                  fill="none"
                  stroke={mode.color}
                  strokeWidth="2.5"
                  strokeDasharray={mode.dash}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  opacity="0.95"
                />
              )),
            )}

          {/* origin marker (emerald) */}
          <g>
            <circle cx={from.x} cy={from.y} r="14" fill="#34d399" opacity="0.18" />
            <circle cx={from.x} cy={from.y} r="6" fill="#34d399" stroke="#022c22" strokeWidth="2" />
            <text
              x={from.x}
              y={from.y + 30}
              textAnchor={labelAnchor(from.x)}
              fontSize="17"
              fontWeight="600"
              fill="#a7f3d0"
            >
              {countryName(origin)}
            </text>
          </g>

          {/* destination marker (sky) */}
          {!domestic && (
            <g>
              <circle cx={to.x} cy={to.y} r="14" fill="#38bdf8" opacity="0.18" />
              <circle cx={to.x} cy={to.y} r="6" fill="#38bdf8" stroke="#082f49" strokeWidth="2" />
              <text
                x={to.x}
                y={to.y + 30}
                textAnchor={labelAnchor(to.x)}
                fontSize="17"
                fontWeight="600"
                fill="#bae6fd"
              >
                {countryName(destination)}
              </text>
            </g>
          )}
        </svg>

        {/* transport-mode badges pinned to each route's midpoint */}
        {!domestic &&
          laneGeometry.map(({ mode, midpoint }: { mode: ModeStyle; midpoint: Pt }) => (
            <span
              key={mode.key}
              className={`absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-slate-950 ${mode.borderClass} ${mode.iconClass}`}
              style={{
                left: `${(midpoint.x / MAP_W) * 100}%`,
                top: `${(midpoint.y / MAP_H) * 100}%`,
              }}
            >
              <mode.icon className="h-3.5 w-3.5" />
            </span>
          ))}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-300">
        {domestic ? (
          <span className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-emerald-300" />
            Domestic movement — origin and destination are both{" "}
            {countryName(origin)}.
          </span>
        ) : (
          lanes.map((mode) => (
            <span key={mode.key} className="flex items-center gap-2">
              <mode.icon className={`h-3.5 w-3.5 ${mode.iconClass}`} />
              <svg width="34" height="6" aria-hidden>
                <line
                  x1="0"
                  y1="3"
                  x2="34"
                  y2="3"
                  stroke={mode.color}
                  strokeWidth="2.5"
                  strokeDasharray={mode.dash}
                />
              </svg>
              {mode.label}
            </span>
          ))
        )}
        {!domestic && !selected && (
          <span className="text-slate-500">
            No shipping method selected — showing the common options.
          </span>
        )}
        <span className="text-slate-500">
          Illustrative routing — actual carrier paths will differ.
        </span>
      </div>
    </div>
  );
}
