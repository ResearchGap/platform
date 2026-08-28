import { Badge } from "@platform/ui/components/badge";
import { buttonVariants } from "@platform/ui/components/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@platform/ui/components/card";
import { ExternalLink, KeyRound, Pencil, Plus, UserRoundPlus, Users } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";
import { notFound } from "next/navigation";

import { BootcampOperationalActions, SessionActions } from "@/components/mentor/bootcamp-actions";
import { PageHeading } from "@/components/public/page-heading";
import { PublicEmptyState } from "@/components/public/public-states";
import { getManagedBootcamp, listBootcampSessions } from "@/lib/api/mentor";
import { formatDate, formatDateTime, readableLabel } from "@/lib/public-format";
import { authenticatedRequestInit } from "@/lib/server-auth";

export default async function OperationsBootcampDetailPage({
  params,
}: {
  params: Promise<{ bootcampId: string }>;
}) {
  const { bootcampId } = await params;
  const requestInit = await authenticatedRequestInit();
  const [bootcamp, sessions] = await Promise.all([
    getManagedBootcamp(bootcampId, requestInit),
    listBootcampSessions(bootcampId, requestInit),
  ]).catch(() => notFound());
  const draft = bootcamp.status === "DRAFT";
  const sessionIds = sessions.map((item) => item.id);
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeading
          eyebrow="Bootcamp operations"
          title={bootcamp.title}
          description={bootcamp.description}
        />
        <div className="flex flex-wrap gap-2">
          {bootcamp.status !== "COMPLETED" && bootcamp.status !== "ARCHIVED" ? (
            <Link
              href={`/operations/bootcamps/${bootcamp.id}/edit` as Route}
              className={buttonVariants({ variant: "outline" })}
            >
              <Pencil data-icon="inline-start" aria-hidden="true" />
              Edit
            </Link>
          ) : null}
          <BootcampOperationalActions bootcampId={bootcamp.id} status={bootcamp.status} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge>{readableLabel(bootcamp.status)}</Badge>
        {bootcamp.publishedBy ? (
          <Badge variant="outline">Published by {bootcamp.publishedBy.name}</Badge>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Info
          label="Dates"
          value={`${formatDate(bootcamp.startDate)} - ${formatDate(bootcamp.endDate)}`}
        />
        <Info
          label="Registration deadline"
          value={
            bootcamp.registrationDeadline
              ? formatDateTime(bootcamp.registrationDeadline)
              : "Not set"
          }
        />
        <Info label="Created by" value={bootcamp.createdBy.name} />
      </div>
      <div className="flex flex-wrap gap-2">
        <Link
          href={`/operations/bootcamps/${bootcamp.id}/participants` as Route}
          className={buttonVariants({ variant: "outline" })}
        >
          <Users data-icon="inline-start" aria-hidden="true" />
          Participants
        </Link>
        <Link
          href={`/operations/bootcamps/${bootcamp.id}/mentors` as Route}
          className={buttonVariants({ variant: "outline" })}
        >
          <UserRoundPlus data-icon="inline-start" aria-hidden="true" />
          Mentors
        </Link>
        <Link
          href={`/operations/bootcamps/${bootcamp.id}/enrollment-keys` as Route}
          className={buttonVariants({ variant: "outline" })}
        >
          <KeyRound data-icon="inline-start" aria-hidden="true" />
          Enrollment keys
        </Link>
      </div>
      {bootcamp.whatYouGet ? (
        <section className="max-w-4xl">
          <h2 className="text-xl font-semibold">What participants receive</h2>
          <p className="mt-3 whitespace-pre-wrap text-muted-foreground">{bootcamp.whatYouGet}</p>
        </section>
      ) : null}
      <section className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-semibold">Sessions</h2>
            <p className="text-sm text-muted-foreground">
              Ordered schedule and protected learning resources.
            </p>
          </div>
          {draft ? (
            <Link
              href={`/operations/bootcamps/${bootcamp.id}/sessions/new` as Route}
              className={buttonVariants({ variant: "brand" })}
            >
              <Plus data-icon="inline-start" aria-hidden="true" />
              Add session
            </Link>
          ) : null}
        </div>
        {sessions.length === 0 ? (
          <PublicEmptyState
            title="No sessions yet"
            description="Sessions can be added while the Bootcamp is a draft."
          />
        ) : (
          <div className="flex flex-col gap-4">
            {sessions.map((session, index) => (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant="secondary">Session {index + 1}</Badge>
                    <Badge variant="outline">{readableLabel(session.sessionType)}</Badge>
                  </div>
                  <CardTitle>{session.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-3 text-sm">
                  <p>
                    {formatDateTime(session.scheduledAt)}
                    {session.speakerName ? ` - ${session.speakerName}` : ""}
                  </p>
                  {session.description ? (
                    <p className="text-muted-foreground">{session.description}</p>
                  ) : null}
                  {session.venue ? (
                    <p>
                      <span className="font-medium">Venue / meeting:</span> {session.venue}
                    </p>
                  ) : null}
                  <div className="flex flex-wrap gap-3">
                    {resourceLinks(session).map(([label, href]) => (
                      <a
                        key={label}
                        href={href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-primary hover:underline"
                      >
                        {label}
                        <ExternalLink className="size-3.5" aria-hidden="true" />
                      </a>
                    ))}
                  </div>
                </CardContent>
                {draft ? (
                  <CardFooter className="flex flex-wrap justify-between gap-3">
                    <Link
                      href={
                        `/operations/bootcamps/${bootcamp.id}/sessions/${session.id}/edit` as Route
                      }
                      className={buttonVariants({ variant: "outline", size: "sm" })}
                    >
                      <Pencil data-icon="inline-start" aria-hidden="true" />
                      Edit
                    </Link>
                    <SessionActions
                      bootcampId={bootcamp.id}
                      sessionId={session.id}
                      sessionIds={sessionIds}
                      index={index}
                    />
                  </CardFooter>
                ) : null}
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{label}</CardTitle>
      </CardHeader>
      <CardContent className="font-medium">{value}</CardContent>
    </Card>
  );
}

function resourceLinks(session: {
  feedbackUrl: string | null;
  moduleUrl: string | null;
  postTestUrl: string | null;
  preTestUrl: string | null;
  recordingUrl: string | null;
}): [string, string][] {
  return [
    ["Module", session.moduleUrl],
    ["Pre-test", session.preTestUrl],
    ["Post-test", session.postTestUrl],
    ["Feedback", session.feedbackUrl],
    ["Recording", session.recordingUrl],
  ].filter((item): item is [string, string] => Boolean(item[1]));
}
