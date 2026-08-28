import { buttonVariants } from "@platform/ui/components/button";
import { KeyRound, Plus } from "lucide-react";
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

export const metadata: Metadata = { title: "Mentor Bootcamps" };
const statuses = ["DRAFT", "REVIEW", "PUBLISHED", "COMPLETED", "ARCHIVED"] as const;
function statusValue(value?: string): BootcampStatus | undefined {
  return statuses.find((status) => status === value);
}

export default async function MentorBootcampsPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string; status?: string }>;
}) {
  const query = await searchParams;
  const status = statusValue(query.status);
  let page = null;
  try {
    page = await listManagedBootcamps(
      { cursor: query.cursor, status },
      await authenticatedRequestInit(),
    );
  } catch {}
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeading
          eyebrow="Mentor workspace"
          title="Bootcamps"
          description="Manage Bootcamps you created or are actively assigned to."
        />
        <div className="flex flex-wrap gap-2">
          <Link href="/mentor/bootcamps/join" className={buttonVariants({ variant: "outline" })}>
            <KeyRound data-icon="inline-start" aria-hidden="true" />
            Join with key
          </Link>
          <Link href="/mentor/bootcamps/new" className={buttonVariants({ variant: "brand" })}>
            <Plus data-icon="inline-start" aria-hidden="true" />
            Create Bootcamp
          </Link>
        </div>
      </div>
      <FilterNav
        label="Bootcamp status"
        options={[
          { label: "All", href: "/mentor/bootcamps", active: !status },
          ...statuses.map((item) => ({
            label: item[0] + item.slice(1).toLowerCase(),
            href: `/mentor/bootcamps?status=${item}` as Route,
            active: status === item,
          })),
        ]}
      />
      {!page ? (
        <PublicErrorState title="Bootcamps could not be loaded" />
      ) : page.items.length === 0 ? (
        <PublicEmptyState
          title="No matching Bootcamps"
          description="Create a Bootcamp or join one using a Mentor key."
        />
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {page.items.map((item) => (
              <MentorBootcampCard key={item.id} bootcamp={item} />
            ))}
          </div>
          <LoadMoreLink cursor={page.nextCursor} pathname="/mentor/bootcamps" query={{ status }} />
        </>
      )}
    </div>
  );
}
