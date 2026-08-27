import { Button } from "@platform/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@platform/ui/components/empty";
import { Skeleton } from "@platform/ui/components/skeleton";
import { CircleAlert, SearchX } from "lucide-react";

export function PublicEmptyState({
  description = "There is nothing published here yet. Please check again later.",
  title = "No published items",
}: {
  description?: string;
  title?: string;
}) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <SearchX aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>{title}</EmptyTitle>
        <EmptyDescription>{description}</EmptyDescription>
      </EmptyHeader>
    </Empty>
  );
}

export function PublicErrorState({ retry }: { retry?: () => void }) {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <CircleAlert aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>We could not load this page</EmptyTitle>
        <EmptyDescription>
          The public service is temporarily unavailable. Please try again shortly.
        </EmptyDescription>
      </EmptyHeader>
      {retry ? (
        <EmptyContent>
          <Button type="button" variant="outline" onClick={retry}>
            Try again
          </Button>
        </EmptyContent>
      ) : null}
    </Empty>
  );
}

export function PublicCardGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }, (_, index) => (
        <div key={`skeleton-${index}`} className="overflow-hidden rounded-xl border bg-card">
          <Skeleton className="aspect-video rounded-none" />
          <div className="flex flex-col gap-3 p-5">
            <Skeleton className="h-5 w-24" />
            <Skeleton className="h-6 w-4/5" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      ))}
    </div>
  );
}
