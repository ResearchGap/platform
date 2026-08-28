import { buttonVariants } from "@platform/ui/components/button";
import { Plus } from "lucide-react";
import type { Metadata } from "next";
import type { Route } from "next";
import Link from "next/link";
import { ManagedContentCard } from "@/components/mentor/managed-content-card";
import { FilterNav } from "@/components/public/filter-nav";
import { LoadMoreLink } from "@/components/public/load-more-link";
import { PageHeading } from "@/components/public/page-heading";
import { PublicEmptyState, PublicErrorState } from "@/components/public/public-states";
import { listManagedContent } from "@/lib/api/mentor";
import type { ContentStatus } from "@/lib/api/mentor-types";
import { authenticatedRequestInit } from "@/lib/server-auth";
export const metadata: Metadata = { title: "Managed Research Content" };
const statuses = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
function statusValue(value?: string): ContentStatus | undefined {
  return statuses.find((status) => status === value);
}
export default async function MentorContentPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string; status?: string }>;
}) {
  const query = await searchParams;
  const status = statusValue(query.status);
  let page = null;
  try {
    page = await listManagedContent(
      { cursor: query.cursor, status },
      await authenticatedRequestInit(),
    );
  } catch {}
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeading
          eyebrow="Mentor workspace"
          title="Research Content"
          description="Create and edit content owned by your Mentor account."
        />
        <Link href="/mentor/content/new" className={buttonVariants({ variant: "brand" })}>
          <Plus data-icon="inline-start" aria-hidden="true" />
          Create draft
        </Link>
      </div>
      <FilterNav
        label="Content status"
        options={[
          { label: "All", href: "/mentor/content", active: !status },
          ...statuses.map((item) => ({
            label: item[0] + item.slice(1).toLowerCase(),
            href: `/mentor/content?status=${item}` as Route,
            active: status === item,
          })),
        ]}
      />
      {!page ? (
        <PublicErrorState title="Content could not be loaded" />
      ) : page.items.length === 0 ? (
        <PublicEmptyState title="No matching content" />
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {page.items.map((item) => (
              <ManagedContentCard key={item.id} content={item} />
            ))}
          </div>
          <LoadMoreLink cursor={page.nextCursor} pathname="/mentor/content" query={{ status }} />
        </>
      )}
    </div>
  );
}
