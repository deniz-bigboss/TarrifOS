import OgImage from "./opengraph-image";

// Route-segment config must be literal per file for Next's static analysis.
export const runtime = "edge";
export const alt = "Kustaro — Classify products for customs before they ship";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default OgImage;
