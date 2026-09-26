import type { MetadataRoute } from "next";
import { adminClient } from "@/lib/supabase/admin";

const BASE = "https://swiito.in";

const STATIC: MetadataRoute.Sitemap = [
  { url: BASE, priority: 1.0, changeFrequency: "daily" },
  { url: `${BASE}/properties`, priority: 0.9, changeFrequency: "hourly" },
  { url: `${BASE}/how-it-works`, priority: 0.7, changeFrequency: "monthly" },
  { url: `${BASE}/about`, priority: 0.6, changeFrequency: "monthly" },
  { url: `${BASE}/faq`, priority: 0.6, changeFrequency: "weekly" },
  { url: `${BASE}/contact`, priority: 0.5, changeFrequency: "yearly" },
  { url: `${BASE}/legal/privacy`, priority: 0.3, changeFrequency: "yearly" },
  { url: `${BASE}/legal/terms`, priority: 0.3, changeFrequency: "yearly" },
  { url: `${BASE}/legal/grievance`, priority: 0.3, changeFrequency: "yearly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [listingsResult, localitiesResult] = await Promise.all([
    adminClient
      .from("properties")
      .select("slug, published_at, updated_at")
      .eq("status", "approved")
      .not("slug", "is", null),
    adminClient
      .from("localities")
      .select("slug"),
  ]);

  const listings: MetadataRoute.Sitemap = (listingsResult.data ?? []).map((p) => ({
    url: `${BASE}/properties/${p.slug}`,
    lastModified: p.updated_at ?? p.published_at ?? new Date().toISOString(),
    priority: 0.8,
    changeFrequency: "weekly" as const,
  }));

  const localities: MetadataRoute.Sitemap = (localitiesResult.data ?? []).map((l) => ({
    url: `${BASE}/ranchi/${l.slug}`,
    priority: 0.7,
    changeFrequency: "daily" as const,
  }));

  return [...STATIC, ...listings, ...localities];
}
