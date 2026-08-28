import { buttonVariants } from "@platform/ui/components/button";
import { Plus } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";

import { ManagedContentCard } from "@/components/mentor/managed-content-card";
import { FilterNav } from "@/components/public/filter-nav";
import { LoadMoreLink } from "@/components/public/load-more-link";
import { PageHeading } from "@/components/public/page-heading";
import { PublicEmptyState, PublicErrorState } from "@/components/public/public-states";
import { listManagedContent } from "@/lib/api/mentor";
import type { ContentStatus } from "@/lib/api/mentor-types";
import type { ContentType } from "@/lib/api/public-types";
import { readableLabel } from "@/lib/public-format";
import { authenticatedRequestInit } from "@/lib/server-auth";

export const metadata: Metadata = { title: "Research Content Operations" };
const statuses = ["DRAFT", "PUBLISHED", "ARCHIVED"] as const;
const types = ["NEWS", "ARTICLE", "ANNOUNCEMENT"] as const;

export default async function MarketingContentPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string; status?: string; type?: string }>;
}) {
  const query = await searchParams;
  const status = statuses.find((item) => item === query.status) as ContentStatus | undefined;
  const type = types.find((item) => item === query.type) as ContentType | undefined;
  const page = await listManagedContent(
    { cursor: query.cursor, status, type },
    await authenticatedRequestInit(),
  ).catch(() => null);
  const pathname = "/marketing/content" as Route;
  const contentHref = (next: { status?: ContentStatus; type?: ContentType }) => {
    const params = new URLSearchParams();
    if (next.status) params.set("status", next.status);
    if (next.type) params.set("type", next.type);
    return `${pathname}${params.size ? `?${params}` : ""}` as Route;
  };
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeading
          eyebrow="CMO workspace"
          title="Research Content"
          description="Create, present, publish, and archive ResearchGap public content."
        />
        <Link
          href={"/marketing/content/new" as Route}
          className={buttonVariants({ variant: "brand" })}
        >
          <Plus data-icon="inline-start" aria-hidden="true" />
          Create draft
        </Link>
      </div>
      <FilterNav
        label="Publication status"
        options={[
          { label: "All", href: contentHref({ type }), active: !status },
          ...statuses.map((item) => ({
            label: readableLabel(item),
            href: contentHref({ status: item, type }),
            active: status === item,
          })),
        ]}
      />
      <FilterNav
        label="Content type"
        options={[
          { label: "All types", href: contentHref({ status }), active: !type },
          ...types.map((item) => ({
            label: readableLabel(item),
            href: contentHref({ status, type: item }),
            active: type === item,
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
              <ManagedContentCard key={item.id} content={item} basePath="/marketing/content" />
            ))}
          </div>
          <LoadMoreLink cursor={page.nextCursor} pathname={pathname} query={{ status, type }} />
        </>
      )}
    </div>
  );
}
