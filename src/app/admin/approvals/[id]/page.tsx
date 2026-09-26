import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getAdminListingFull } from "@/lib/queries/admin";
import { ApprovalClient } from "@/components/admin/ApprovalClient";

export const metadata: Metadata = { title: "Review listing — Swiito Admin" };

export default async function ApprovalReviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listing = await getAdminListingFull(id);

  if (!listing || listing.status !== "pending") notFound();

  return <ApprovalClient listing={listing} />;
}
