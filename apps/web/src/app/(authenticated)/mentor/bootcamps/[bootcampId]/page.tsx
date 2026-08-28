import { Badge } from "@platform/ui/components/badge";
import { buttonVariants } from "@platform/ui/components/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@platform/ui/components/card";
import { ExternalLink, Pencil, Plus, Users } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";

import { SessionActions, SubmitBootcampButton } from "@/components/mentor/bootcamp-actions";
import { PageHeading } from "@/components/public/page-heading";
import { PublicEmptyState } from "@/components/public/public-states";
import { getManagedBootcamp, listBootcampMentors, listBootcampSessions } from "@/lib/api/mentor";
import { formatDate, formatDateTime, readableLabel } from "@/lib/public-format";
import { authenticatedRequestInit, getServerAuthContext } from "@/lib/server-auth";

export default async function ManageBootcampPage({
  params,
}: {
  params: Promise<{ bootcampId: string }>;
}) {
  const { bootcampId } = await params;
  const [requestInit, auth] = await Promise.all([
    authenticatedRequestInit(),
    getServerAuthContext(),
  ]);
  const [bootcamp, sessions, mentors] = await Promise.all([
    getManagedBootcamp(bootcampId, requestInit),
    listBootcampSessions(bootcampId, requestInit),
    listBootcampMentors(bootcampId, requestInit),
  ]).catch(() => notFound());
  const assignment = mentors.items.find((item) => item.mentorId === auth?.account.user.id);
  const editable = bootcamp.status === "DRAFT";
  const sessionIds = sessions.map((session) => session.id);
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeading
          eyebrow="Bootcamp management"
          title={bootcamp.title}
          description={bootcamp.description}
        />
        <div className="flex flex-wrap gap-2">
          {editable ? (
            <>
              <Link
                href={`/mentor/bootcamps/${bootcamp.id}/edit`}
                className={buttonVariants({ variant: "outline" })}
              >
                <Pencil data-icon="inline-start" aria-hidden="true" />
                Edit
              </Link>
              <SubmitBootcampButton bootcampId={bootcamp.id} />
            </>
          ) : null}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge>{readableLabel(bootcamp.status)}</Badge>
        {assignment ? (
          <Badge variant="outline">Assignment: {readableLabel(assignment.assignmentSource)}</Badge>
        ) : null}
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <Info
          label="Dates"
          value={`${formatDate(bootcamp.startDate)} – ${formatDate(bootcamp.endDate)}`}
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
              Ordered session information and external learning resources.
            </p>
          </div>
          <div className="flex gap-2">
            <Link
              href={`/mentor/bootcamps/${bootcamp.id}/participants`}
              className={buttonVariants({ variant: "outline" })}
            >
              <Users data-icon="inline-start" aria-hidden="true" />
              Participants
            </Link>
            {editable ? (
              <Link
                href={`/mentor/bootcamps/${bootcamp.id}/sessions/new`}
                className={buttonVariants({ variant: "brand" })}
              >
                <Plus data-icon="inline-start" aria-hidden="true" />
                Add session
              </Link>
            ) : null}
          </div>
        </div>
        {sessions.length === 0 ? (
          <PublicEmptyState
            title="No sessions yet"
            description="Add the first session while this Bootcamp is a draft."
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
                    {session.speakerName ? ` · ${session.speakerName}` : ""}
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
                        <ExternalLink aria-hidden="true" className="size-3.5" />
                      </a>
                    ))}
                  </div>
                </CardContent>
                {editable ? (
                  <CardFooter className="flex flex-wrap justify-between gap-3">
                    <Link
                      href={`/mentor/bootcamps/${bootcamp.id}/sessions/${session.id}/edit`}
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
