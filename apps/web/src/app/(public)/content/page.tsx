import type { Metadata, Route } from "next";

import { ContentCard } from "@/components/public/content-card";
import { FilterNav } from "@/components/public/filter-nav";
import { LoadMoreLink } from "@/components/public/load-more-link";
import { PageHeading } from "@/components/public/page-heading";
import { PublicEmptyState, PublicErrorState } from "@/components/public/public-states";
import { listPublicContent } from "@/lib/api/public";
import type { ContentType } from "@/lib/api/public-types";

export const metadata: Metadata = {
  title: "Research Content",
  description: "Read published research news, articles, and announcements from ResearchGap.",
};

const contentFilters: readonly { href: Route; label: string; value?: ContentType }[] = [
  { href: "/content", label: "All" },
  { href: "/content?type=NEWS", label: "News", value: "NEWS" },
  { href: "/content?type=ARTICLE", label: "Articles", value: "ARTICLE" },
  { href: "/content?type=ANNOUNCEMENT", label: "Announcements", value: "ANNOUNCEMENT" },
];

function selectedType(value: string | string[] | undefined): ContentType | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate === "NEWS" || candidate === "ARTICLE" || candidate === "ANNOUNCEMENT"
    ? candidate
    : undefined;
}

export default async function ContentListPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string | string[]; type?: string | string[] }>;
}) {
  const query = await searchParams;
  const type = selectedType(query.type);
  const cursor = Array.isArray(query.cursor) ? query.cursor[0] : query.cursor;

  try {
    const page = await listPublicContent({ cursor, filter: type });
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <PageHeading
          eyebrow="Published insights"
          title="Research Content"
          description="Explore concise updates, practical research articles, and announcements from ResearchGap."
        />
        <FilterNav
          label="Filter research content"
          options={contentFilters.map((filter) => ({
            active: filter.value === type,
            href: filter.href,
            label: filter.label,
          }))}
        />
        {page.items.length === 0 ? (
          <PublicEmptyState />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {page.items.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        )}
        <LoadMoreLink cursor={page.nextCursor} pathname="/content" query={{ type }} />
      </div>
    );
  } catch {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <PageHeading
          eyebrow="Published insights"
          title="Research Content"
          description="Explore concise updates, practical research articles, and announcements from ResearchGap."
        />
        <PublicErrorState />
      </div>
    );
  }
}
