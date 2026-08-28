import { Badge } from "@platform/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@platform/ui/components/card";
import type { Route } from "next";
import { notFound } from "next/navigation";

import {
  DeactivateEnrollmentKeyButton,
  EnrollmentKeyCreator,
} from "@/components/operations/enrollment-key-actions";
import { FilterNav } from "@/components/public/filter-nav";
import { LoadMoreLink } from "@/components/public/load-more-link";
import { PageHeading } from "@/components/public/page-heading";
import { PublicEmptyState } from "@/components/public/public-states";
import { getManagedBootcamp, listEnrollmentKeys } from "@/lib/api/mentor";
import type { EnrollmentKeyDetail } from "@/lib/api/mentor-types";
import { formatDateTime, readableLabel } from "@/lib/public-format";
import { authenticatedRequestInit } from "@/lib/server-auth";

const statuses = ["ACTIVE", "INACTIVE", "EXPIRED", "EXHAUSTED"] as const;

export default async function EnrollmentKeysPage({
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
  const status = statuses.find((item) => item === query.status) as
    | EnrollmentKeyDetail["status"]
    | undefined;
  const [bootcamp, page] = await Promise.all([
    getManagedBootcamp(bootcampId, requestInit),
    listEnrollmentKeys(bootcampId, { cursor: query.cursor, status }, requestInit),
  ]).catch(() => notFound());
  const pathname = `/operations/bootcamps/${bootcampId}/enrollment-keys` as Route;
  return (
    <div className="flex flex-col gap-8">
      <PageHeading
        eyebrow="Enrollment operations"
        title={bootcamp.title}
        description="Issue audience-specific keys and monitor their effective state and usage."
      />
      <EnrollmentKeyCreator bootcampId={bootcampId} />
      <FilterNav
        label="Effective status"
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
        <PublicEmptyState title="No matching enrollment keys" />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {page.items.map((key) => (
              <Card key={key.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge>{readableLabel(key.audience)}</Badge>
                    <Badge variant="outline">{readableLabel(key.status)}</Badge>
                  </div>
                  <CardTitle className="text-base">
                    Key ending {key.keyHint || "not available"}
                  </CardTitle>
                  <CardDescription>Created by {key.createdBy.name}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
                  <p>
                    Usage: {key.usageCount}
                    {key.maxUses === null ? " / unlimited" : ` / ${key.maxUses}`}
                  </p>
                  <p>Expires: {key.expiresAt ? formatDateTime(key.expiresAt) : "Never"}</p>
                  <p>Created: {formatDateTime(key.createdAt)}</p>
                </CardContent>
                {key.status === "ACTIVE" ? (
                  <CardFooter>
                    <DeactivateEnrollmentKeyButton bootcampId={bootcampId} keyId={key.id} />
                  </CardFooter>
                ) : null}
              </Card>
            ))}
          </div>
          <LoadMoreLink cursor={page.nextCursor} pathname={pathname} query={{ status }} />
        </>
      )}
    </div>
  );
}
