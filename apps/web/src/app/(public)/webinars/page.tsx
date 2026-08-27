import type { Metadata, Route } from "next";

import { FilterNav } from "@/components/public/filter-nav";
import { LoadMoreLink } from "@/components/public/load-more-link";
import { PageHeading } from "@/components/public/page-heading";
import { PublicEmptyState, PublicErrorState } from "@/components/public/public-states";
import { WebinarCard } from "@/components/public/webinar-card";
import { listPublicWebinars } from "@/lib/api/public";
import type { WebinarTiming } from "@/lib/api/public-types";

export const metadata: Metadata = {
  title: "Webinars",
  description: "Discover published ResearchGap webinars and external registration opportunities.",
};

const timingFilters: readonly { href: Route; label: string; value?: WebinarTiming }[] = [
  { href: "/webinars", label: "All" },
  { href: "/webinars?timing=UPCOMING", label: "Upcoming", value: "UPCOMING" },
  { href: "/webinars?timing=PAST", label: "Past", value: "PAST" },
];

function selectedTiming(value: string | string[] | undefined): WebinarTiming | undefined {
  const candidate = Array.isArray(value) ? value[0] : value;
  return candidate === "UPCOMING" || candidate === "PAST" ? candidate : undefined;
}

export default async function WebinarListPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string | string[]; timing?: string | string[] }>;
}) {
  const query = await searchParams;
  const timing = selectedTiming(query.timing);
  const cursor = Array.isArray(query.cursor) ? query.cursor[0] : query.cursor;

  try {
    const page = await listPublicWebinars({ cursor, filter: timing });
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <PageHeading
          eyebrow="External events"
          title="Webinars"
          description="Find useful research sessions and register directly with the external event organizer."
        />
        <FilterNav
          label="Filter webinars"
          options={timingFilters.map((filter) => ({
            active: filter.value === timing,
            href: filter.href,
            label: filter.label,
          }))}
        />
        {page.items.length === 0 ? (
          <PublicEmptyState title="No webinars found" />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {page.items.map((webinar) => (
              <WebinarCard key={webinar.id} webinar={webinar} />
            ))}
          </div>
        )}
        <LoadMoreLink cursor={page.nextCursor} pathname="/webinars" query={{ timing }} />
      </div>
    );
  } catch {
    return (
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <PageHeading
          eyebrow="External events"
          title="Webinars"
          description="Find useful research sessions and register directly with the external event organizer."
        />
        <PublicErrorState />
      </div>
    );
  }
}
