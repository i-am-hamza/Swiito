import type { Metadata } from "next";
import { getAdminSettings, getAdminAmenities } from "@/lib/queries/admin";
import { SettingsClient } from "@/components/admin/SettingsClient";

export const metadata: Metadata = { title: "Settings — Swiito Admin" };

export default async function AdminSettingsPage() {
  const [settings, amenities] = await Promise.all([
    getAdminSettings(),
    getAdminAmenities(),
  ]);

  return (
    <div className="max-w-3xl space-y-4">
      <h1 className="font-display font-bold text-2xl text-fg">Settings</h1>
      <SettingsClient settings={settings} amenities={amenities} />
    </div>
  );
}
