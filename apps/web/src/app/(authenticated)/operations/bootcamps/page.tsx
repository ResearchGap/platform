import { buttonVariants } from "@platform/ui/components/button";
import { Plus } from "lucide-react";
import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";

import { MentorBootcampCard } from "@/components/mentor/mentor-bootcamp-card";
import { FilterNav } from "@/components/public/filter-nav";
import { LoadMoreLink } from "@/components/public/load-more-link";
import { PageHeading } from "@/components/public/page-heading";
import { PublicEmptyState, PublicErrorState } from "@/components/public/public-states";
import { listManagedBootcamps } from "@/lib/api/mentor";
import type { BootcampStatus } from "@/lib/api/mentor-types";
import { authenticatedRequestInit } from "@/lib/server-auth";

export const metadata: Metadata = { title: "Bootcamp Operations" };
const statuses = ["DRAFT", "REVIEW", "PUBLISHED", "COMPLETED", "ARCHIVED"] as const;

export default async function OperationsBootcampsPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string; status?: string }>;
}) {
  const query = await searchParams;
  const status = statuses.find((item) => item === query.status) as BootcampStatus | undefined;
  const page = await listManagedBootcamps(
    { cursor: query.cursor, status },
    await authenticatedRequestInit(),
  ).catch(() => null);
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeading
          eyebrow="COO operations"
          title="Bootcamps"
          description="Review and operate all ResearchGap Bootcamps."
        />
        <Link
          href={"/operations/bootcamps/new" as Route}
          className={buttonVariants({ variant: "brand" })}
        >
          <Plus data-icon="inline-start" aria-hidden="true" />
          Create Bootcamp
        </Link>
      </div>
      <FilterNav
        label="Bootcamp status"
        options={[
          { label: "All", href: "/operations/bootcamps" as Route, active: !status },
          ...statuses.map((item) => ({
            label: item[0] + item.slice(1).toLowerCase(),
            href: `/operations/bootcamps?status=${item}` as Route,
            active: status === item,
          })),
        ]}
      />
      {!page ? (
        <PublicErrorState title="Bootcamps could not be loaded" />
      ) : page.items.length === 0 ? (
        <PublicEmptyState title="No matching Bootcamps" />
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {page.items.map((item) => (
              <MentorBootcampCard key={item.id} bootcamp={item} basePath="/operations/bootcamps" />
            ))}
          </div>
          <LoadMoreLink
            cursor={page.nextCursor}
            pathname={"/operations/bootcamps" as Route}
            query={{ status }}
          />
        </>
      )}
    </div>
  );
}
