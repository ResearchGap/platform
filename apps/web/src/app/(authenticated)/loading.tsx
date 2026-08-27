import { Skeleton } from "@platform/ui/components/skeleton";

export default function AuthenticatedLoading() {
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-3">
        <Skeleton className="h-4 w-28" />
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-5 w-full max-w-xl" />
      </div>
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 3 }, (_, index) => (
          <div
            key={`mentee-loading-${index}`}
            className="overflow-hidden rounded-xl border bg-card"
          >
            <Skeleton className="aspect-video rounded-none" />
            <div className="flex flex-col gap-3 p-5">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-6 w-4/5" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
