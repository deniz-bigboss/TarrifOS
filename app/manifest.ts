import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Kustaro",
    short_name: "Kustaro",
    description:
      "Self-serve customs-readiness workspace: HS-code candidates, document checklists, risk flags, and exportable reports.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#0e7490",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
