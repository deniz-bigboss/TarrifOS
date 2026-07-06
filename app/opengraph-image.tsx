import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Kustaro — Classify products for customs before they ship";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Social share card: dark slate, the K checkpoint mark, headline + promise. */
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          backgroundColor: "#020617",
          backgroundImage:
            "radial-gradient(circle at 85% 15%, rgba(14,116,144,0.35), transparent 55%)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "24px" }}>
          <svg width="88" height="88" viewBox="0 0 32 32" fill="none">
            <rect x="6" y="4" width="5" height="24" rx="1.5" fill="#2dd4bf" />
            <path
              d="M25 5.5 14 15.2a1.6 1.6 0 0 0 0 1.6L25 26.5"
              stroke="#0e7490"
              strokeWidth="5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <circle cx="13.5" cy="16" r="2.6" fill="#2dd4bf" />
          </svg>
          <div style={{ display: "flex", fontSize: 64, fontWeight: 700, color: "#f8fafc" }}>
            Kustaro
          </div>
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 48,
            fontSize: 58,
            fontWeight: 600,
            color: "#f8fafc",
            lineHeight: 1.15,
            maxWidth: 950,
          }}
        >
          Classify products for customs before they ship.
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 28,
            fontSize: 28,
            color: "#94a3b8",
            maxWidth: 900,
            lineHeight: 1.4,
          }}
        >
          HS-code candidates · confidence scores · document checklists · risk
          flags · customs-readiness reports
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 44,
            width: 220,
            height: 8,
            borderRadius: 4,
            backgroundColor: "#0e7490",
          }}
        />
      </div>
    ),
    size,
  );
}
