import type { Metadata, Route } from "next";

import { BootcampCard } from "@/components/public/bootcamp-card";
import { FilterNav } from "@/components/public/filter-nav";
import { LoadMoreLink } from "@/components/public/load-more-link";
import { PageHeading } from "@/components/public/page-heading";
import { PublicEmptyState, PublicErrorState } from "@/components/public/public-states";
import { listPublicBootcamps } from "@/lib/api/public";
import type { BootcampTiming } from "@/lib/api/public-types";

export const metadata: Metadata = {
  title: "Bootcamps",
  description: "Explore published ResearchGap bootcamp programs and public session outlines.",
};

const timingFilters: readonly { href: Route; label: string; value?: BootcampTiming }[] = [
  { href: "/bootcamps", label: "All" },
  { href: "/bootcamps?timing=UPCOMING", label: "Upcoming", value: "UPCOMING" },
  { href: "/bootcamps?timing=ONGOING", label: "Ongoing", value: "ONGOING" },
  { href: "/bootcamps?timing=COMPLETED", label: "Completed", value: "COMPLETED" },
];

function selectedTiming(value: string | string[] | undefined): BootcampTiming | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate === "UPCOMING" || candidate === "ONGOING" || candidate === "COMPLETED"
    ? candidate
    : undefined;
}

export default async function BootcampListPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string | string[]; timing?: string | string[] }>;
}) {
  const query = await searchParams;
  const timing = selectedTiming(query.timing);
  const cursor = Array.isArray(query.cursor) ? query.cursor[0] : query.cursor;

  try {
    const page = await listPublicBootcamps({ cursor, filter: timing });
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <PageHeading
          eyebrow="Structured programs"
          title="Bootcamps"
          description="Discover focused programs, understand what you will receive, and preview the planned sessions."
        />
        <FilterNav
          label="Filter bootcamps"
          options={timingFilters.map((filter) => ({
            active: filter.value === timing,
            href: filter.href,
            label: filter.label,
          }))}
        />
        {page.items.length === 0 ? (
          <PublicEmptyState title="No bootcamps found" />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {page.items.map((bootcamp) => (
              <BootcampCard key={bootcamp.id} bootcamp={bootcamp} />
            ))}
          </div>
        )}
        <LoadMoreLink cursor={page.nextCursor} pathname="/bootcamps" query={{ timing }} />
      </div>
    );
  } catch {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <PageHeading
          eyebrow="Structured programs"
          title="Bootcamps"
          description="Discover focused programs, understand what you will receive, and preview the planned sessions."
        />
        <PublicErrorState />
      </div>
    );
  }
}
