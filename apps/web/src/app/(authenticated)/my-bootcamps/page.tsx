import type { Metadata } from "next";

import { MyBootcampCard } from "@/components/mentee/my-bootcamp-card";
import { FilterNav } from "@/components/public/filter-nav";
import { LoadMoreLink } from "@/components/public/load-more-link";
import { PageHeading } from "@/components/public/page-heading";
import { PublicEmptyState, PublicErrorState } from "@/components/public/public-states";
import { listMyBootcamps } from "@/lib/api/mentee";
import type { EnrollmentStatus, MenteePage, MyBootcampEnrollment } from "@/lib/api/mentee-types";
import { authenticatedRequestInit } from "@/lib/server-auth";

export const metadata: Metadata = { title: "My Bootcamps" };

type Filter = Extract<EnrollmentStatus, "ACTIVE" | "COMPLETED">;

function selectedStatus(value: string | undefined): Filter | undefined {
  return value === "ACTIVE" || value === "COMPLETED" ? value : undefined;
}

export default async function MyBootcampsPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string; status?: string }>;
}) {
  const query = await searchParams;
  const status = selectedStatus(query.status);
  let page: MenteePage<MyBootcampEnrollment> | null;
  try {
    page = await listMyBootcamps(
      { cursor: query.cursor, status },
      await authenticatedRequestInit(),
    );
  } catch {
    page = null;
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeading
        eyebrow="Learning"
        title="My Bootcamps"
        description="Access current and completed Bootcamps without fabricated progress metrics."
      />
      <FilterNav
        label="Enrollment status"
        options={[
          { label: "All", href: "/my-bootcamps", active: status === undefined },
          { label: "Current", href: "/my-bootcamps?status=ACTIVE", active: status === "ACTIVE" },
          {
            label: "Completed",
            href: "/my-bootcamps?status=COMPLETED",
            active: status === "COMPLETED",
          },
        ]}
      />
      {page === null ? (
        <PublicErrorState
          title="My Bootcamps could not be loaded"
          description="Please refresh the page or try again shortly."
        />
      ) : page.items.length === 0 ? (
        <PublicEmptyState
          title="No matching Bootcamps"
          description="Enroll in a published Bootcamp using a Mentee enrollment key."
        />
      ) : (
        <>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {page.items.map((enrollment) => (
              <MyBootcampCard key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>
          <LoadMoreLink cursor={page.nextCursor} pathname="/my-bootcamps" query={{ status }} />
        </>
      )}
    </div>
  );
}
