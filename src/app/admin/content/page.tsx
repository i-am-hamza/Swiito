import type { Metadata } from "next";
import { getAdminContent } from "@/lib/queries/admin";
import { ContentClient } from "@/components/admin/ContentClient";

export const metadata: Metadata = { title: "Content — Swiito Admin" };

export default async function AdminContentPage() {
  const content = await getAdminContent();
  return (
    <div className="max-w-4xl space-y-4">
      <h1 className="font-display font-bold text-2xl text-fg">Content</h1>
      <ContentClient content={content} />
    </div>
  );
}
