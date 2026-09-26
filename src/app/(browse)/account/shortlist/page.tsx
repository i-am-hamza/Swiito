import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getUserShortlist, getUserShortlistedIds } from "@/lib/queries/shortlist";
import { PropertyGrid } from "@/components/property/PropertyGrid";
import { EmptyState } from "@/components/ui/EmptyState";

export default async function ShortlistPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/sign-in?next=/account/shortlist");

  const [properties, shortlistedIds] = await Promise.all([
    getUserShortlist(),
    getUserShortlistedIds(),
  ]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display font-bold text-2xl text-fg">My shortlist</h1>
          <p className="text-sm text-fg-muted mt-1">
            {properties.length === 0
              ? "No saved properties"
              : `${properties.length} saved ${properties.length === 1 ? "property" : "properties"}`}
          </p>
        </div>
        <Link href="/account" className="text-xs text-accent hover:underline">
          ← Back to account
        </Link>
      </div>

      {properties.length === 0 ? (
        <EmptyState
          title="Your shortlist is empty"
          description="Tap the heart icon on any property to save it here."
          action={
            <Link
              href="/properties"
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-full bg-accent text-on-accent text-sm font-medium min-h-[44px]"
            >
              Browse properties
            </Link>
          }
        />
      ) : (
        <PropertyGrid properties={properties} shortlistedIds={shortlistedIds} />
      )}
    </div>
  );
}
