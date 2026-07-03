import { haversineKm, type LatLng } from "./great-circle";

/**
 * Maritime routing over a hand-built network of open-water waypoints and the
 * real chokepoints that define global shipping — Suez & Panama canals, the
 * Straits of Malacca, Gibraltar and Hormuz, Bab-el-Mandeb, the Cape of Good
 * Hope and Cape Horn, and trans-Pacific / trans-Atlantic lanes.
 *
 * A ship route is the shortest path (Dijkstra, great-circle edge weights)
 * across this graph. Endpoints connect to their nearest coastal waypoints, so
 * two-coast countries (US, Canada, Russia…) enter via whichever ocean is
 * actually closer for the lane. This is illustrative, not navigational — but
 * it follows the real arteries instead of drawing a line through a continent.
 */

const NODES: Record<string, LatLng> = {
  // --- Atlantic & the Americas ---
  us_east: [39, -71],
  ca_east: [45, -52],
  gulf_mex: [25, -90],
  carib: [15, -74],
  panama_a: [9.4, -79.9],
  panama_p: [7.3, -79.6],
  natl_mid: [33, -45],
  natl_ne: [46, -22],
  satl: [-10, -25],
  brazil_e: [-13, -37],
  arg_e: [-42, -57],
  cape_horn: [-57, -67],
  wafr: [2, 2],
  us_west: [35, -126],
  mex_west: [16, -105],
  cca_west: [8, -90],
  peru_w: [-12, -80],
  chile_w: [-38, -76],

  // --- Europe & the Mediterranean ---
  biscay: [46, -10],
  gibraltar: [36, -7],
  wmed: [38, 4],
  cmed: [36, 14],
  emed: [34, 28],
  aegean: [37, 25],
  bosphorus: [41, 29],
  blacksea: [44, 35],
  channel: [49.5, -4],
  northsea: [56, 3],
  baltic: [58, 20],
  norway: [65, 4],

  // --- Suez, Red Sea, Middle East, Indian Ocean ---
  suez: [30, 32.5],
  redsea: [22, 38],
  bab: [12.5, 43.4],
  aden: [12, 51],
  arabian: [15, 62],
  hormuz: [26.5, 56.6],
  gulf: [27, 51],
  india_w: [16, 71],
  india_s: [6, 78],
  cbengal: [10, 88],
  cape_gh: [-35, 19],
  moz: [-24, 40],
  indian_c: [-28, 74],

  // --- SE Asia & the Pacific ---
  malacca: [3, 99],
  singapore: [1.2, 104],
  java: [-8, 111],
  scs: [13, 114],
  manila: [14, 122],
  china_e: [31, 124],
  korea: [34, 128],
  japan_s: [33, 140],
  japan_e: [37, 147],
  npac_w: [42, 168],
  npac_m: [44, 179],
  npac_e: [42, -150],
  cpac_w: [3, 158],
  cpac_m: [0, 179],
  cpac_e: [2, -120],
  aus_n: [-11, 130],
  aus_e: [-33, 153],
  aus_w: [-32, 113],
  nz: [-42, 175],
  spac_m: [-30, 180],
};

// Bidirectional open-water connections (and canal links). Each pair is a leg
// that stays on water; the graph's shortest path chains them into a route.
const EDGES: [string, string][] = [
  // North Atlantic trunk
  ["us_east", "ca_east"], ["us_east", "natl_mid"], ["us_east", "gulf_mex"],
  ["us_east", "carib"], ["ca_east", "natl_ne"], ["natl_mid", "natl_ne"],
  ["natl_ne", "biscay"], ["natl_ne", "gibraltar"], ["biscay", "channel"],
  ["natl_mid", "satl"], ["natl_mid", "gibraltar"],
  // Caribbean / Panama
  ["gulf_mex", "carib"], ["carib", "panama_a"], ["panama_a", "panama_p"],
  ["carib", "brazil_e"],
  // South Atlantic
  ["satl", "brazil_e"], ["satl", "wafr"], ["satl", "cape_gh"],
  ["brazil_e", "arg_e"], ["arg_e", "cape_horn"], ["wafr", "gibraltar"],
  ["wafr", "cape_gh"],
  // Europe north
  ["channel", "northsea"], ["northsea", "baltic"], ["northsea", "norway"],
  ["gibraltar", "biscay"],
  // Mediterranean & Black Sea
  ["gibraltar", "wmed"], ["wmed", "cmed"], ["cmed", "emed"], ["cmed", "aegean"],
  ["emed", "aegean"], ["aegean", "bosphorus"], ["bosphorus", "blacksea"],
  // Suez Canal + Red Sea + Arabian Sea
  ["emed", "suez"], ["suez", "redsea"], ["redsea", "bab"], ["bab", "aden"],
  ["aden", "arabian"], ["arabian", "hormuz"], ["hormuz", "gulf"],
  ["arabian", "india_w"], ["aden", "cape_gh"],
  // Indian Ocean
  ["india_w", "india_s"], ["india_s", "cbengal"], ["india_s", "indian_c"],
  ["cbengal", "malacca"], ["indian_c", "cape_gh"], ["indian_c", "moz"],
  ["moz", "cape_gh"], ["indian_c", "aus_w"], ["arabian", "indian_c"],
  // Malacca / SE Asia
  ["malacca", "singapore"], ["singapore", "scs"], ["singapore", "java"],
  ["scs", "manila"], ["scs", "china_e"], ["scs", "aus_n"], ["java", "aus_n"],
  // East Asia
  ["china_e", "korea"], ["korea", "japan_s"], ["china_e", "japan_s"],
  ["japan_s", "japan_e"], ["manila", "japan_s"],
  // North Pacific
  ["japan_e", "npac_w"], ["npac_w", "npac_m"], ["npac_m", "npac_e"],
  ["npac_e", "us_west"], ["npac_e", "ca_east"], ["us_west", "mex_west"],
  // Central Pacific
  ["scs", "cpac_w"], ["manila", "cpac_w"], ["cpac_w", "cpac_m"],
  ["cpac_m", "cpac_e"], ["cpac_e", "cca_west"], ["cca_west", "mex_west"],
  ["cca_west", "panama_p"], ["cca_west", "peru_w"],
  // Americas west coast
  ["mex_west", "us_west"], ["peru_w", "chile_w"], ["chile_w", "cape_horn"],
  ["panama_p", "peru_w"],
  // Australia / NZ / South Pacific
  ["aus_n", "aus_e"], ["aus_e", "nz"], ["aus_n", "aus_w"], ["aus_e", "spac_m"],
  ["nz", "spac_m"], ["spac_m", "cpac_e"], ["aus_w", "cape_gh"],
];

interface Graph {
  [id: string]: { to: string; w: number }[];
}

const GRAPH: Graph = (() => {
  const g: Graph = {};
  for (const id of Object.keys(NODES)) g[id] = [];
  for (const [a, b] of EDGES) {
    const w = haversineKm(NODES[a], NODES[b]);
    g[a].push({ to: b, w });
    g[b].push({ to: a, w });
  }
  return g;
})();

/** The k node ids nearest to a coordinate, by great-circle distance. */
function nearestNodes(point: LatLng, k: number): string[] {
  return Object.keys(NODES)
    .map((id) => ({ id, d: haversineKm(point, NODES[id]) }))
    .sort((a, b) => a.d - b.d)
    .slice(0, k)
    .map((n) => n.id);
}

/**
 * Shortest sea route from origin to destination as a list of [lat,lng]
 * waypoints (origin coord first, destination coord last). Endpoints are wired
 * to their 3 nearest coastal waypoints so Dijkstra can pick the right ocean.
 * Returns null if the two points are effectively the same.
 */
export function seaRoute(origin: LatLng, destination: LatLng): LatLng[] | null {
  if (haversineKm(origin, destination) < 1) return null;

  const START = "__start__";
  const END = "__end__";
  const adj: Graph = { ...GRAPH };
  // Clone endpoints' adjacency so we don't mutate the shared graph.
  for (const id of Object.keys(GRAPH)) adj[id] = GRAPH[id].slice();
  adj[START] = [];
  adj[END] = [];

  for (const id of nearestNodes(origin, 3)) {
    const w = haversineKm(origin, NODES[id]);
    adj[START].push({ to: id, w });
    adj[id] = adj[id].concat({ to: START, w });
  }
  for (const id of nearestNodes(destination, 3)) {
    const w = haversineKm(destination, NODES[id]);
    adj[END].push({ to: id, w });
    adj[id] = adj[id].concat({ to: END, w });
  }

  // Dijkstra (small graph → linear scan for the min is fine).
  const dist: Record<string, number> = {};
  const prev: Record<string, string | null> = {};
  const visited = new Set<string>();
  for (const id of Object.keys(adj)) {
    dist[id] = Infinity;
    prev[id] = null;
  }
  dist[START] = 0;

  while (true) {
    let u: string | null = null;
    let best = Infinity;
    for (const id of Object.keys(adj)) {
      if (!visited.has(id) && dist[id] < best) {
        best = dist[id];
        u = id;
      }
    }
    if (u === null || u === END) break;
    visited.add(u);
    for (const { to, w } of adj[u]) {
      if (dist[u] + w < dist[to]) {
        dist[to] = dist[u] + w;
        prev[to] = u;
      }
    }
  }

  if (dist[END] === Infinity) return null;

  const path: string[] = [];
  for (let n: string | null = END; n; n = prev[n]) path.unshift(n);

  const coords: LatLng[] = [origin];
  for (const id of path) {
    if (id === START || id === END) continue;
    coords.push(NODES[id]);
  }
  coords.push(destination);
  return coords;
}
