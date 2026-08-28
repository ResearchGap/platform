import { Badge } from "@platform/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@platform/ui/components/card";
import { notFound } from "next/navigation";
import type { Route } from "next";

import { FilterNav } from "@/components/public/filter-nav";
import { LoadMoreLink } from "@/components/public/load-more-link";
import { PageHeading } from "@/components/public/page-heading";
import { PublicEmptyState } from "@/components/public/public-states";
import { getManagedBootcamp, listBootcampParticipants } from "@/lib/api/mentor";
import type { Participant } from "@/lib/api/mentor-types";
import { formatDate, readableLabel } from "@/lib/public-format";
import { authenticatedRequestInit } from "@/lib/server-auth";

const statuses = ["ACTIVE", "COMPLETED", "CANCELLED"] as const;
function statusValue(value?: string): Participant["status"] | undefined {
  return statuses.find((status) => status === value);
}

export default async function ParticipantsPage({
  params,
  searchParams,
}: {
  params: Promise<{ bootcampId: string }>;
  searchParams: Promise<{ cursor?: string; status?: string }>;
}) {
  const [{ bootcampId }, query, requestInit] = await Promise.all([
    params,
    searchParams,
    authenticatedRequestInit(),
  ]);
  const status = statusValue(query.status);
  const [bootcamp, page] = await Promise.all([
    getManagedBootcamp(bootcampId, requestInit),
    listBootcampParticipants(bootcampId, { cursor: query.cursor, status }, requestInit),
  ]).catch(() => notFound());
  const pathname = `/mentor/bootcamps/${bootcampId}/participants` as Route;
  return (
    <div className="flex flex-col gap-8">
      <PageHeading
        eyebrow="Bootcamp participants"
        title={bootcamp.title}
        description="Participant information intentionally exposed by the Bootcamp API."
      />
      <FilterNav
        label="Enrollment status"
        options={[
          { label: "All", href: pathname, active: !status },
          ...statuses.map((item) => ({
            label: readableLabel(item),
            href: `${pathname}?status=${item}` as Route,
            active: status === item,
          })),
        ]}
      />
      {page.items.length === 0 ? (
        <PublicEmptyState title="No matching participants" />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {page.items.map((participant) => (
              <Card key={participant.id}>
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle className="text-base">{participant.mentee.name}</CardTitle>
                    <Badge variant="outline">{readableLabel(participant.status)}</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <p>{participant.mentee.email}</p>
                  <p>Enrolled {formatDate(participant.enrolledAt)}</p>
                  {participant.mentee.profile?.institution ? (
                    <p>{participant.mentee.profile.institution}</p>
                  ) : null}
                  {participant.mentee.profile?.researchField ? (
                    <p>{participant.mentee.profile.researchField}</p>
                  ) : null}
                </CardContent>
              </Card>
            ))}
          </div>
          <LoadMoreLink cursor={page.nextCursor} pathname={pathname} query={{ status }} />
        </>
      )}
    </div>
  );
}
