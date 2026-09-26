import { Suspense } from "react";
import type { Metadata } from "next";
import { getAdminProperties } from "@/lib/queries/admin";
import { PropertiesClient } from "@/components/admin/PropertiesClient";
import type { PropertyStatus } from "@/types";

export const metadata: Metadata = { title: "Properties — Swiito Admin" };

export default async function AdminPropertiesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string>>;
}) {
  const params = await searchParams;
  const status = (params.status ?? "all") as PropertyStatus | "all";
  const listingType = (params.listingType ?? "all") as "rent" | "sale" | "all";
  const search = params.search ?? "";
  const page = Number(params.page ?? 1);
  const stale = params.stale === "true";

  const result = await getAdminProperties({
    status,
    listingType,
    search,
    stale,
    page,
    perPage: 25,
  });

  return (
    <div className="max-w-6xl space-y-4">
      <h1 className="font-display font-bold text-2xl text-fg">Properties</h1>
      <Suspense fallback={null}>
        <PropertiesClient
          result={result}
          initialStatus={status}
          initialListingType={listingType}
          initialSearch={search}
          isStale={stale}
        />
      </Suspense>
    </div>
  );
}
