import { buttonVariants } from "@platform/ui/components/button";
import { Plus } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";

import { ManagedWebinarCard } from "@/components/mentor/managed-webinar-card";
import { FilterNav } from "@/components/public/filter-nav";
import { LoadMoreLink } from "@/components/public/load-more-link";
import { PageHeading } from "@/components/public/page-heading";
import { PublicEmptyState, PublicErrorState } from "@/components/public/public-states";
import { listManagedWebinars } from "@/lib/api/mentor";
import type { WebinarStatus } from "@/lib/api/mentor-types";
import { authenticatedRequestInit } from "@/lib/server-auth";

export const metadata: Metadata = { title: "Webinar Operations" };
const statuses = ["DRAFT", "PUBLISHED", "COMPLETED", "ARCHIVED"] as const;

export default async function OperationsWebinarsPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string; status?: string }>;
}) {
  const query = await searchParams;
  const status = statuses.find((item) => item === query.status) as WebinarStatus | undefined;
  const page = await listManagedWebinars(
    { cursor: query.cursor, status },
    await authenticatedRequestInit(),
  ).catch(() => null);
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeading
          eyebrow="COO operations"
          title="Webinars"
          description="Operate all Webinar information, schedules, and protected external meeting links."
        />
        <Link
          href={"/operations/webinars/new" as Route}
          className={buttonVariants({ variant: "brand" })}
        >
          <Plus data-icon="inline-start" aria-hidden="true" />
          Create Webinar
        </Link>
      </div>
      <FilterNav
        label="Webinar status"
        options={[
          { label: "All", href: "/operations/webinars" as Route, active: !status },
          ...statuses.map((item) => ({
            label: item[0] + item.slice(1).toLowerCase(),
            href: `/operations/webinars?status=${item}` as Route,
            active: status === item,
          })),
        ]}
      />
      {!page ? (
        <PublicErrorState title="Webinars could not be loaded" />
      ) : page.items.length === 0 ? (
        <PublicEmptyState title="No matching Webinars" />
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {page.items.map((item) => (
              <ManagedWebinarCard key={item.id} webinar={item} basePath="/operations/webinars" />
            ))}
          </div>
          <LoadMoreLink
            cursor={page.nextCursor}
            pathname={"/operations/webinars" as Route}
            query={{ status }}
          />
        </>
      )}
    </div>
  );
}
