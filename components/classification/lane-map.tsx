import { MapPin, Plane, Truck } from "lucide-react";
import { COUNTRY_CENTROIDS, projectToSvg } from "@/lib/geo/country-centroids";
import { countryName } from "@/lib/utils";

/**
 * LaneMap — illustrative origin → destination trade-lane map for the
 * shipment execution plan. Pure server-rendered SVG (no client JS, no
 * external tiles): a simplified world backdrop with the two endpoints
 * marked and the air lane (dashed sky arc + plane) drawn differently
 * from the road/surface lane (solid amber path + truck).
 */

const W = 1000;
const H = 500;

/* Hand-drawn, deliberately simplified landmass shapes in equirectangular
   projection — recognizable continents, not survey-grade geography. */
const LANDMASSES: string[] = [
  // North America
  "M42,72 L130,52 L230,48 L300,60 L339,100 L319,125 L289,153 L275,175 L253,194 L278,225 L236,208 L194,181 L167,156 L153,117 L78,89 Z",
  // Greenland
  "M339,33 L439,56 L381,83 L353,67 Z",
  // South America
  "M300,219 L333,228 L403,264 L392,292 L383,314 L344,347 L308,394 L311,403 L297,361 L306,300 L275,261 L283,228 Z",
  // Eurasia (one landmass to avoid seams)
  "M514,78 L569,53 L778,39 L972,61 L985,70 L950,97 L889,89 L856,139 L853,150 L836,167 L817,186 L803,217 L786,244 L772,211 L753,189 L728,206 L714,228 L697,194 L675,181 L647,178 L636,211 L625,214 L608,194 L592,167 L600,150 L583,150 L572,144 L561,147 L553,139 L544,144 L525,128 L511,131 L500,142 L483,150 L475,142 L494,122 L486,117 L514,103 L525,92 L550,83 Z",
  // Britain & Ireland
  "M489,89 L503,103 L492,110 L481,100 Z",
  // Japan
  "M894,128 L889,150 L864,158 L884,133 Z",
  // Africa
  "M483,153 L528,147 L569,164 L592,167 L611,208 L642,219 L628,244 L611,261 L597,306 L592,322 L553,344 L539,314 L536,283 L525,250 L517,239 L478,239 L469,236 L453,211 L453,192 L472,167 Z",
  // Madagascar
  "M636,286 L631,319 L622,311 L625,294 Z",
  // Australia
  "M853,289 L881,283 L894,281 L925,319 L917,353 L892,356 L850,339 L819,344 L814,311 Z",
  // Indonesia / New Guinea hints
  "M775,244 L795,252 L783,258 Z",
  "M810,244 L830,250 L818,258 Z",
  "M878,258 L905,262 L888,272 Z",
  // New Zealand
  "M968,360 L980,378 L970,382 Z",
];

interface LaneMapProps {
  origin: string;
  destination: string;
}

export function LaneMap({ origin, destination }: LaneMapProps) {
  const o = COUNTRY_CENTROIDS[(origin || "").toUpperCase()];
  const d = COUNTRY_CENTROIDS[(destination || "").toUpperCase()];
  if (!o || !d) return null;

  const from = projectToSvg(o[0], o[1], W, H);
  const to = projectToSvg(d[0], d[1], W, H);
  const domestic = origin.toUpperCase() === destination.toUpperCase();

  // Quadratic-bezier control points: air arcs toward the pole, the surface
  // route bows the other way so the two lanes never overlap.
  const midX = (from.x + to.x) / 2;
  const midY = (from.y + to.y) / 2;
  const span = Math.hypot(to.x - from.x, to.y - from.y);
  const lift = Math.min(Math.max(span * 0.28, 36), 110);
  const airCtrl = { x: midX, y: Math.max(midY - lift, 14) };
  const roadCtrl = { x: midX, y: Math.min(midY + lift * 0.5, H - 14) };
  // Curve apex at t = 0.5 for icon placement.
  const airApex = { x: midX, y: 0.25 * from.y + 0.5 * airCtrl.y + 0.25 * to.y };
  const roadApex = { x: midX, y: 0.25 * from.y + 0.5 * roadCtrl.y + 0.25 * to.y };

  const labelAnchor = (x: number) =>
    x < 140 ? "start" : x > W - 140 ? "end" : "middle";

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
          viewBox={`0 0 ${W} ${H}`}
          className="block h-auto w-full"
          role="img"
          aria-label={`Illustrative trade lane from ${countryName(origin)} to ${countryName(destination)}`}
        >
          {/* graticule */}
          <g stroke="#1e293b" strokeWidth="1" opacity="0.55">
            {[100, 200, 300, 400].map((y) => (
              <line key={`h${y}`} x1="0" y1={y} x2={W} y2={y} />
            ))}
            {[167, 333, 500, 667, 833].map((x) => (
              <line key={`v${x}`} x1={x} y1="0" x2={x} y2={H} />
            ))}
          </g>

          {/* landmasses */}
          <g fill="#293548" stroke="#334155" strokeWidth="1.5" strokeLinejoin="round">
            {LANDMASSES.map((path) => (
              <path key={path.slice(0, 18)} d={path} />
            ))}
          </g>

          {!domestic && (
            <>
              {/* road / surface lane — solid amber */}
              <path
                d={`M${from.x},${from.y} Q${roadCtrl.x},${roadCtrl.y} ${to.x},${to.y}`}
                fill="none"
                stroke="#f59e0b"
                strokeWidth="2.5"
                strokeLinecap="round"
                opacity="0.9"
              />
              {/* air lane — dashed sky arc */}
              <path
                d={`M${from.x},${from.y} Q${airCtrl.x},${airCtrl.y} ${to.x},${to.y}`}
                fill="none"
                stroke="#38bdf8"
                strokeWidth="2.5"
                strokeDasharray="8 7"
                strokeLinecap="round"
              />
            </>
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

        {/* transport-mode badges pinned to each curve's apex */}
        {!domestic && (
          <>
            <span
              className="absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-sky-400/50 bg-slate-950 text-sky-300"
              style={{
                left: `${(airApex.x / W) * 100}%`,
                top: `${(airApex.y / H) * 100}%`,
              }}
            >
              <Plane className="h-3.5 w-3.5" />
            </span>
            <span
              className="absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-amber-400/50 bg-slate-950 text-amber-300"
              style={{
                left: `${(roadApex.x / W) * 100}%`,
                top: `${(roadApex.y / H) * 100}%`,
              }}
            >
              <Truck className="h-3.5 w-3.5" />
            </span>
          </>
        )}
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-300">
        {domestic ? (
          <span className="flex items-center gap-2">
            <MapPin className="h-3.5 w-3.5 text-emerald-300" />
            Domestic movement — origin and destination are both{" "}
            {countryName(origin)}.
          </span>
        ) : (
          <>
            <span className="flex items-center gap-2">
              <Plane className="h-3.5 w-3.5 text-sky-300" />
              <svg width="34" height="6" aria-hidden>
                <line x1="0" y1="3" x2="34" y2="3" stroke="#38bdf8" strokeWidth="2.5" strokeDasharray="6 5" />
              </svg>
              Air freight lane
            </span>
            <span className="flex items-center gap-2">
              <Truck className="h-3.5 w-3.5 text-amber-300" />
              <svg width="34" height="6" aria-hidden>
                <line x1="0" y1="3" x2="34" y2="3" stroke="#f59e0b" strokeWidth="2.5" />
              </svg>
              Road / surface lane
            </span>
          </>
        )}
        <span className="text-slate-500">
          Illustrative routing — actual carrier paths will differ.
        </span>
      </div>
    </div>
  );
}
