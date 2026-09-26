import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/owner/",
          "/account/",
          "/api/",
          "/sign-in",
          "/sign-up",
        ],
      },
    ],
    sitemap: "https://swiito.in/sitemap.xml",
  };
}
