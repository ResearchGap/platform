import { buttonVariants } from "@platform/ui/components/button";
import { ArrowDown } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

export function LoadMoreLink({
  cursor,
  pathname,
  query = {},
}: {
  cursor: string | null;
  pathname: Route;
  query?: Readonly<Record<string, string | undefined>>;
}) {
  if (!cursor) {
    return null;
  }

  return (
    <div className="flex justify-center">
      <Link
        href={{ pathname, query: { ...query, cursor } }}
        className={buttonVariants({ variant: "outline", size: "lg" })}
      >
        Load more
        <ArrowDown data-icon="inline-end" aria-hidden="true" />
      </Link>
    </div>
  );
}
