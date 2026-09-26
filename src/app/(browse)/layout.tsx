import type { ReactNode } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { getSiteSettings } from "@/lib/queries/settings";
import { createClient } from "@/lib/supabase/server";

export default async function BrowseLayout({ children }: { children: ReactNode }) {
  const [settings, supabase] = await Promise.all([
    getSiteSettings(),
    createClient(),
  ]);
  const { data: { user } } = await supabase.auth.getUser();
  return (
    <>
      <Header user={user ? { id: user.id, email: user.email } : null} />
      {children}
      <Footer settings={settings} />
    </>
  );
}
