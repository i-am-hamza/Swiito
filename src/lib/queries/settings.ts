import { createClient } from "@/lib/supabase/server";

export interface SiteSettings {
  broker_whatsapp: string;
  broker_phone: string;
  broker_display: string;
  instagram_url: string;
}

const DEFAULTS: SiteSettings = {
  broker_whatsapp: "917488459279",
  broker_phone: "+917488459279",
  broker_display: "+91 74884 59279",
  instagram_url: "https://www.instagram.com/city_vlogs7/",
};

export async function getSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("settings")
    .select("key, value")
    .in("key", Object.keys(DEFAULTS));

  if (!data?.length) return DEFAULTS;

  const map = Object.fromEntries(data.map((r) => [r.key, r.value]));
  return {
    broker_whatsapp: map.broker_whatsapp ?? DEFAULTS.broker_whatsapp,
    broker_phone: map.broker_phone ?? DEFAULTS.broker_phone,
    broker_display: map.broker_display ?? DEFAULTS.broker_display,
    instagram_url: map.instagram_url ?? DEFAULTS.instagram_url,
  };
}
