import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Swiito — Verified Properties in Ranchi",
    short_name: "Swiito",
    description:
      "Find verified flats, rooms, PGs, and houses for rent and sale in Ranchi.",
    start_url: "/",
    display: "standalone",
    background_color: "#0E3A1C",
    theme_color: "#164F24",
    icons: [
      {
        src: "/icons/icon-192.png",
        sizes: "192x192",
        type: "image/png",
        purpose: "maskable",
      },
      {
        src: "/icons/icon-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "any",
      },
    ],
  };
}
