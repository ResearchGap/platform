import { Badge } from "@platform/ui/components/badge";
import { buttonVariants } from "@platform/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@platform/ui/components/card";
import { Input } from "@platform/ui/components/input";
import { Search } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import {
  AssignMentorButton,
  RemoveMentorButton,
} from "@/components/operations/mentor-assignment-actions";
import { PageHeading } from "@/components/public/page-heading";
import { PublicEmptyState } from "@/components/public/public-states";
import { getManagedBootcamp, listBootcampMentors, listEligibleMentors } from "@/lib/api/mentor";
import { readableLabel } from "@/lib/public-format";
import { authenticatedRequestInit } from "@/lib/server-auth";

export default async function BootcampMentorsPage({
  params,
  searchParams,
}: {
  params: Promise<{ bootcampId: string }>;
  searchParams: Promise<{ mentorCursor?: string; eligibleCursor?: string; search?: string }>;
}) {
  const [{ bootcampId }, query, requestInit] = await Promise.all([
    params,
    searchParams,
    authenticatedRequestInit(),
  ]);
  const [bootcamp, assigned, eligible] = await Promise.all([
    getManagedBootcamp(bootcampId, requestInit),
    listBootcampMentors(bootcampId, { cursor: query.mentorCursor, limit: 25 }, requestInit),
    listEligibleMentors(
      { cursor: query.eligibleCursor, search: query.search, limit: 25 },
      requestInit,
    ),
  ]).catch(() => notFound());
  const assignedIds = new Set(assigned.items.map((item) => item.mentorId));
  const candidates = eligible.items.filter((item) => !assignedIds.has(item.id));
  const pathname = `/operations/bootcamps/${bootcampId}/mentors` as Route;
  return (
    <div className="flex flex-col gap-8">
      <PageHeading
        eyebrow="Mentor assignments"
        title={bootcamp.title}
        description="Assign active Mentors and review how each assignment was created."
      />
      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold">Assigned Mentors</h2>
        {assigned.items.length === 0 ? (
          <PublicEmptyState title="No Mentor assigned" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {assigned.items.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <CardTitle className="text-base">{item.mentor.name}</CardTitle>
                    <Badge variant="outline">{readableLabel(item.assignmentSource)}</Badge>
                  </div>
                  <CardDescription>{item.mentor.email}</CardDescription>
                </CardHeader>
                <CardContent className="text-sm text-muted-foreground">
                  Status: {readableLabel(item.status)}
                </CardContent>
                <CardFooter>
                  {item.assignmentSource === "CREATOR" ? (
                    <p className="text-xs text-muted-foreground">
                      Creator assignment is protected.
                    </p>
                  ) : (
                    <RemoveMentorButton bootcampId={bootcampId} mentorId={item.mentorId} />
                  )}
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        {assigned.nextCursor ? (
          <Link
            className={buttonVariants({ variant: "outline" })}
            href={{ pathname, query: { search: query.search, mentorCursor: assigned.nextCursor } }}
          >
            More assigned Mentors
          </Link>
        ) : null}
      </section>
      <section className="flex flex-col gap-4">
        <div>
          <h2 className="text-xl font-semibold">Eligible active Mentors</h2>
          <p className="text-sm text-muted-foreground">
            Search by name or email, then assign as needed.
          </p>
        </div>
        <form className="flex max-w-xl gap-2" action={pathname}>
          <Input
            name="search"
            defaultValue={query.search}
            placeholder="Search active Mentors"
            aria-label="Search active Mentors"
          />
          <button className={buttonVariants({ variant: "outline" })} type="submit">
            <Search data-icon="inline-start" aria-hidden="true" />
            Search
          </button>
        </form>
        {candidates.length === 0 ? (
          <PublicEmptyState title="No eligible Mentor found" />
        ) : (
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {candidates.map((mentor) => (
              <Card key={mentor.id}>
                <CardHeader>
                  <CardTitle className="text-base">{mentor.name}</CardTitle>
                  <CardDescription>{mentor.email}</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
                  {mentor.profile?.affiliation ? <p>{mentor.profile.affiliation}</p> : null}
                  {mentor.profile?.expertise ? <p>{mentor.profile.expertise}</p> : null}
                  {mentor.profile?.researchField ? <p>{mentor.profile.researchField}</p> : null}
                </CardContent>
                <CardFooter>
                  <AssignMentorButton bootcampId={bootcampId} mentorId={mentor.id} />
                </CardFooter>
              </Card>
            ))}
          </div>
        )}
        {eligible.nextCursor ? (
          <Link
            className={buttonVariants({ variant: "outline" })}
            href={{
              pathname,
              query: { search: query.search, eligibleCursor: eligible.nextCursor },
            }}
          >
            More eligible Mentors
          </Link>
        ) : null}
      </section>
    </div>
  );
}
