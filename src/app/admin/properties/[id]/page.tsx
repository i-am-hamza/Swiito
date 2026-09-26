import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAdminListingFull } from "@/lib/queries/admin";
import { PropertyEditClient } from "@/components/admin/PropertyEditClient";

export const metadata: Metadata = { title: "Edit property — Swiito Admin" };

export default async function AdminPropertyEditPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getAdminListingFull(id);

  if (!listing) notFound();

  return (
    <div className="max-w-4xl space-y-4">
      <div>
        <h1 className="font-display font-bold text-xl text-fg">Edit property</h1>
        <p className="text-sm text-fg-muted mt-0.5 line-clamp-1">{listing.title}</p>
      </div>
      <PropertyEditClient
        listing={listing}
        supabaseUrl={process.env.NEXT_PUBLIC_SUPABASE_URL!}
        anonKey={process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!}
      />
    </div>
  );
}
