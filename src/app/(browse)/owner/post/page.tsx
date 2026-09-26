import type { Metadata } from "next";
import { getLocalityOptions, getAmenities } from "@/lib/queries/properties";
import { ListingFormClient } from "@/components/owner/ListingFormClient";

export const metadata: Metadata = {
  title: "Post a Property — Swiito",
};

export default async function PostPropertyPage() {
  const [localities, amenities] = await Promise.all([getLocalityOptions(), getAmenities()]);

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="font-display font-bold text-2xl text-fg">Post a property</h1>
        <p className="text-sm text-fg-muted mt-1">
          Fill in the details below. Your progress is saved automatically.
        </p>
      </div>

      <ListingFormClient
        localities={localities}
        amenities={amenities}
        supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!}
        anonKey={process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!}
      />
    </div>
  );
}
