import { buttonVariants } from "@platform/ui/components/button";
import { Plus } from "lucide-react";
import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { ManagedWebinarCard } from "@/components/mentor/managed-webinar-card";
import { FilterNav } from "@/components/public/filter-nav";
import { LoadMoreLink } from "@/components/public/load-more-link";
import { PageHeading } from "@/components/public/page-heading";
import { PublicEmptyState, PublicErrorState } from "@/components/public/public-states";
import { listManagedWebinars } from "@/lib/api/mentor";
import type { WebinarStatus } from "@/lib/api/mentor-types";
import { authenticatedRequestInit } from "@/lib/server-auth";
export const metadata: Metadata = { title: "Managed Webinars" };
const statuses = ["DRAFT", "PUBLISHED", "COMPLETED", "ARCHIVED"] as const;
function statusValue(value?: string): WebinarStatus | undefined {
  return statuses.find((status) => status === value);
}
export default async function MentorWebinarsPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string; status?: string }>;
}) {
  const query = await searchParams;
  const status = statusValue(query.status);
  let page = null;
  try {
    page = await listManagedWebinars(
      { cursor: query.cursor, status },
      await authenticatedRequestInit(),
    );
  } catch {}
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeading
          eyebrow="Mentor workspace"
          title="Webinars"
          description="Manage Webinar information and protected external meeting links."
        />
        <Link href="/mentor/webinars/new" className={buttonVariants({ variant: "brand" })}>
          <Plus data-icon="inline-start" aria-hidden="true" />
          Create Webinar
        </Link>
      </div>
      <FilterNav
        label="Webinar status"
        options={[
          { label: "All", href: "/mentor/webinars", active: !status },
          ...statuses.map((item) => ({
            label: item[0] + item.slice(1).toLowerCase(),
            href: `/mentor/webinars?status=${item}` as Route,
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
              <ManagedWebinarCard key={item.id} webinar={item} />
            ))}
          </div>
          <LoadMoreLink cursor={page.nextCursor} pathname="/mentor/webinars" query={{ status }} />
        </>
      )}
    </div>
  );
}
