import { Skeleton } from "@/components/ui/Skeleton";

export default function PropertyDetailLoading() {
  return (
    <div className="min-h-screen bg-bg">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-2">
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Gallery */}
      <Skeleton className="w-full rounded-none" style={{ aspectRatio: "16/9" } as React.CSSProperties} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-8">
          <div className="flex-1 min-w-0 flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <Skeleton className="h-9 w-40" />
              <Skeleton className="h-7 w-3/4" />
              <Skeleton className="h-4 w-32" />
            </div>
            <div className="flex flex-col gap-2">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
            <div className="flex flex-col gap-3">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-20 w-full" />
            </div>
          </div>
          <aside className="hidden lg:block w-[300px] xl:w-[320px] shrink-0">
            <Skeleton className="h-56 w-full rounded-xl" />
          </aside>
        </div>
      </div>
    </div>
  );
}
