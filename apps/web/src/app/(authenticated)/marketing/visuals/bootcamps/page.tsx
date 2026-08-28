import type { Metadata, Route } from "next";

import { BootcampVisualCard } from "@/components/marketing/program-visual-card";
import { FilterNav } from "@/components/public/filter-nav";
import { LoadMoreLink } from "@/components/public/load-more-link";
import { PageHeading } from "@/components/public/page-heading";
import { PublicEmptyState, PublicErrorState } from "@/components/public/public-states";
import { listBootcampVisuals } from "@/lib/api/mentor";
import type { BootcampStatus } from "@/lib/api/mentor-types";
import { readableLabel } from "@/lib/public-format";
import { authenticatedRequestInit } from "@/lib/server-auth";

export const metadata: Metadata = { title: "Bootcamp Visuals" };
const statuses = ["DRAFT", "REVIEW", "PUBLISHED", "COMPLETED", "ARCHIVED"] as const;

export default async function BootcampVisualsPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string; status?: string }>;
}) {
  const query = await searchParams;
  const status = statuses.find((item) => item === query.status) as BootcampStatus | undefined;
  const page = await listBootcampVisuals(
    { cursor: query.cursor, status },
    await authenticatedRequestInit(),
  ).catch(() => null);
  const pathname = "/marketing/visuals/bootcamps" as Route;
  return (
    <div className="flex flex-col gap-8">
      <PageHeading
        eyebrow="Program visuals"
        title="Bootcamp covers"
        description="Browse Bootcamps and update only their cover presentation."
      />
      <FilterNav
        label="Bootcamp status"
        options={[
          { label: "All", href: pathname, active: !status },
          ...statuses.map((item) => ({
            label: readableLabel(item),
            href: `${pathname}?status=${item}` as Route,
            active: status === item,
          })),
        ]}
      />
      {!page ? (
        <PublicErrorState title="Bootcamp visuals could not be loaded" />
      ) : page.items.length === 0 ? (
        <PublicEmptyState title="No matching Bootcamps" />
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {page.items.map((item) => (
              <BootcampVisualCard key={item.id} bootcamp={item} />
            ))}
          </div>
          <LoadMoreLink cursor={page.nextCursor} pathname={pathname} query={{ status }} />
        </>
      )}
    </div>
  );
}
