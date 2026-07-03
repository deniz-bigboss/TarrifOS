import { MapPin, Package, Plane, Ship, Truck } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { COUNTRY_CENTROIDS, projectToSvg } from "@/lib/geo/country-centroids";
import { LAND_PATHS, MAP_H, MAP_W, SEA_PATCHES } from "@/lib/geo/world-map";
import { countryName } from "@/lib/utils";

/**
 * LaneMap — origin → destination trade-lane map for the shipment execution
 * plan. Pure server-rendered SVG (no client JS, no external tiles) over
 * simplified real-geography coastlines. Shows ONLY the transport mode the
 * user selected; when no method is chosen it falls back to the two common
 * international options (air + sea) so the map is never empty.
 */

interface ModeStyle {
  key: string;
  label: string;
  color: string;
  dash?: string;
  icon: LucideIcon;
  iconClass: string;
  borderClass: string;
  /** Vertical bias of the curve: negative arcs up (air), positive bows down. */
  bend: number;
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
    bend: -1,
  },
  sea: {
    key: "sea",
    label: "Sea freight lane",
    color: "#22d3ee",
    icon: Ship,
    iconClass: "text-cyan-300",
    borderClass: "border-cyan-400/50",
    bend: 0.55,
  },
  road: {
    key: "road",
    label: "Road freight lane",
    color: "#f59e0b",
    icon: Truck,
    iconClass: "text-amber-300",
    borderClass: "border-amber-400/50",
    bend: 0.35,
  },
  courier: {
    key: "courier",
    label: "Courier / parcel (air network)",
    color: "#a78bfa",
    dash: "3 6",
    icon: Package,
    iconClass: "text-violet-300",
    borderClass: "border-violet-400/50",
    bend: -1,
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

  const from = projectToSvg(o[0], o[1], MAP_W, MAP_H);
  const to = projectToSvg(d[0], d[1], MAP_W, MAP_H);
  const domestic = origin.toUpperCase() === destination.toUpperCase();

  const selected = method ? MODES[method.toLowerCase()] : undefined;
  // No method chosen → show the two common international defaults.
  const lanes = selected ? [selected] : [MODES.air, MODES.sea];

  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const span = Math.hypot(to.x - from.x, to.y - from.y);
  const lift = Math.min(Math.max(span * 0.28, 36), 110);

  const laneGeometry = lanes.map((mode) => {
    const ctrlY = Math.min(
      Math.max(midY + mode.bend * lift, 14),
      MAP_H - 14,
    );
    return {
      mode,
      path: `M${from.x},${from.y} Q${midX},${ctrlY} ${to.x},${to.y}`,
      apex: { x: midX, y: 0.25 * from.y + 0.5 * ctrlY + 0.25 * to.y },
    };
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

          {/* selected transport lane(s) */}
          {!domestic &&
            laneGeometry.map(({ mode, path }) => (
              <path
                key={mode.key}
                d={path}
                fill="none"
                stroke={mode.color}
                strokeWidth="2.5"
                strokeDasharray={mode.dash}
                strokeLinecap="round"
                opacity="0.95"
              />
            ))}

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

        {/* transport-mode badges pinned to each curve's apex */}
        {!domestic &&
          laneGeometry.map(({ mode, apex }) => (
            <span
              key={mode.key}
              className={`absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border bg-slate-950 ${mode.borderClass} ${mode.iconClass}`}
              style={{
                left: `${(apex.x / MAP_W) * 100}%`,
                top: `${(apex.y / MAP_H) * 100}%`,
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
