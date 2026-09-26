import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/types/database";

// Server-only admin client — never import in client components.
// Uses the service role key which bypasses RLS.
export const adminClient = createClient<Database>(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SECRET_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);
