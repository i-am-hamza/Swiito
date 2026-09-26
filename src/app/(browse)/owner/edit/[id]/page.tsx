import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getLocalityOptions, getAmenities } from "@/lib/queries/properties";
import { getOwnerListingFull } from "@/lib/queries/owner";
import { ListingFormClient } from "@/components/owner/ListingFormClient";

export const metadata: Metadata = {
  title: "Edit Listing — Swiito",
};

export default async function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [listing, localities, amenities] = await Promise.all([
    getOwnerListingFull(id),
    getLocalityOptions(),
    getAmenities(),
  ]);

  if (!listing) notFound();

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display font-bold text-2xl text-fg">Edit listing</h1>
        <p className="text-sm text-fg-muted mt-1 line-clamp-1">{listing.title}</p>
      </div>

      <ListingFormClient
        localities={localities}
        amenities={amenities}
        initialData={listing}
        supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!}
        anonKey={process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!}
      />
    </div>
  );
}
