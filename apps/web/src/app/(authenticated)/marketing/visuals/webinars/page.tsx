import type { Metadata, Route } from "next";

import { WebinarVisualCard } from "@/components/marketing/program-visual-card";
import { FilterNav } from "@/components/public/filter-nav";
import { LoadMoreLink } from "@/components/public/load-more-link";
import { PageHeading } from "@/components/public/page-heading";
import { PublicEmptyState, PublicErrorState } from "@/components/public/public-states";
import { listWebinarVisuals } from "@/lib/api/mentor";
import type { WebinarStatus } from "@/lib/api/mentor-types";
import { readableLabel } from "@/lib/public-format";
import { authenticatedRequestInit } from "@/lib/server-auth";

export const metadata: Metadata = { title: "Webinar Visuals" };
const statuses = ["DRAFT", "PUBLISHED", "COMPLETED", "ARCHIVED"] as const;

export default async function WebinarVisualsPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string; status?: string }>;
}) {
  const query = await searchParams;
  const status = statuses.find((item) => item === query.status) as WebinarStatus | undefined;
  const page = await listWebinarVisuals(
    { cursor: query.cursor, status },
    await authenticatedRequestInit(),
  ).catch(() => null);
  const pathname = "/marketing/visuals/webinars" as Route;
  return (
    <div className="flex flex-col gap-8">
      <PageHeading
        eyebrow="Program visuals"
        title="Webinar covers"
        description="Browse Webinars and update only their cover presentation."
      />
      <FilterNav
        label="Webinar status"
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
        <PublicErrorState title="Webinar visuals could not be loaded" />
      ) : page.items.length === 0 ? (
        <PublicEmptyState title="No matching Webinars" />
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {page.items.map((item) => (
              <WebinarVisualCard key={item.id} webinar={item} />
            ))}
          </div>
          <LoadMoreLink cursor={page.nextCursor} pathname={pathname} query={{ status }} />
        </>
      )}
    </div>
  );
}
