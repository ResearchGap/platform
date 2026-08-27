import { Badge } from "@platform/ui/components/badge";
import { buttonVariants } from "@platform/ui/components/button";
import {
  ArrowLeft,
  ArrowRight,
  CalendarClock,
  CalendarRange,
  CheckCircle2,
  UserRound,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MediaCover } from "@/components/public/media-cover";
import { PublicEmptyState, PublicErrorState } from "@/components/public/public-states";
import { PublicApiError } from "@/lib/api/client";
import { getPublicBootcamp, listPublicBootcampSessions } from "@/lib/api/public";
import { formatDate, formatDateTime, readableLabel } from "@/lib/public-format";

type DetailProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: DetailProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const bootcamp = await getPublicBootcamp(slug);
    return { title: bootcamp.title, description: bootcamp.description.slice(0, 160) };
  } catch {
    return { title: "Bootcamp" };
  }
}

export default async function BootcampDetailPage({ params }: DetailProps) {
  const { slug } = await params;
  try {
    const [bootcamp, sessions] = await Promise.all([
      getPublicBootcamp(slug),
      listPublicBootcampSessions(slug),
    ]);

    return (
      <article className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <Link
          href="/bootcamps"
          className={buttonVariants({ variant: "ghost", size: "sm", className: "self-start" })}
        >
          <ArrowLeft data-icon="inline-start" aria-hidden="true" />
          All bootcamps
        </Link>
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="flex flex-col gap-6">
            <div className="overflow-hidden rounded-xl border">
              <MediaCover alt={bootcamp.title} src={bootcamp.cover?.externalUrl} />
            </div>
            <div className="flex flex-col gap-4">
              <Badge variant={bootcamp.status === "COMPLETED" ? "outline" : "secondary"}>
                {readableLabel(bootcamp.status)}
              </Badge>
              <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-5xl">
                {bootcamp.title}
              </h1>
              <p className="whitespace-pre-wrap text-base leading-8 text-muted-foreground">
                {bootcamp.description}
              </p>
            </div>
          </div>
          <aside className="flex flex-col gap-5 rounded-xl border bg-card p-6">
            <h2 className="text-lg font-semibold">Program information</h2>
            <dl className="flex flex-col gap-4 text-sm">
              <div className="flex items-start gap-3">
                <CalendarRange className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <dt className="font-medium">Program dates</dt>
                  <dd className="mt-1 text-muted-foreground">
                    {formatDate(bootcamp.startDate)} – {formatDate(bootcamp.endDate)}
                  </dd>
                </div>
              </div>
              {bootcamp.registrationDeadline ? (
                <div className="flex items-start gap-3">
                  <CalendarClock
                    className="mt-0.5 size-5 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  <div>
                    <dt className="font-medium">Registration deadline</dt>
                    <dd className="mt-1 text-muted-foreground">
                      {formatDateTime(bootcamp.registrationDeadline)}
                    </dd>
                  </div>
                </div>
              ) : null}
            </dl>
            <Link
              href={`/login?next=${encodeURIComponent(`/enroll?bootcampId=${bootcamp.id}`)}`}
              className={buttonVariants({ variant: "brand", size: "lg", className: "w-full" })}
            >
              Log in to enroll
              <ArrowRight data-icon="inline-end" aria-hidden="true" />
            </Link>
            <p className="text-xs leading-5 text-muted-foreground">
              After logging in, enter the Mentee enrollment key provided by the organizer.
            </p>
          </aside>
        </div>

        {bootcamp.whatYouGet ? (
          <section className="flex flex-col gap-4 rounded-xl bg-secondary p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <CheckCircle2 className="size-5 text-primary" aria-hidden="true" />
              <h2 className="text-xl font-semibold">What you will get</h2>
            </div>
            <p className="whitespace-pre-wrap text-sm leading-7 text-secondary-foreground">
              {bootcamp.whatYouGet}
            </p>
          </section>
        ) : null}

        <section className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <h2 className="text-2xl font-bold tracking-tight">Session overview</h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Public schedule information only. Learning links and meeting resources remain
              protected.
            </p>
          </div>
          {sessions.length === 0 ? (
            <PublicEmptyState
              title="Sessions have not been published yet"
              description="The public session outline will appear here when it is available."
            />
          ) : (
            <ol className="grid gap-4 md:grid-cols-2">
              {sessions.map((session) => (
                <li key={session.id} className="flex gap-4 rounded-xl border bg-card p-5">
                  <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-semibold text-primary">
                    {session.sortOrder}
                  </span>
                  <div className="flex min-w-0 flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="font-semibold">{session.title}</h3>
                      <Badge variant="outline">{readableLabel(session.sessionType)}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      {formatDateTime(session.scheduledAt)}
                    </p>
                    {session.speakerName ? (
                      <p className="flex items-center gap-2 text-sm text-muted-foreground">
                        <UserRound className="size-4" aria-hidden="true" />
                        {session.speakerName}
                      </p>
                    ) : null}
                    {session.description ? (
                      <p className="line-clamp-3 text-sm leading-6 text-muted-foreground">
                        {session.description}
                      </p>
                    ) : null}
                  </div>
                </li>
              ))}
            </ol>
          )}
        </section>
      </article>
    );
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) {
      notFound();
    }
    return (
      <div className="mx-auto w-full max-w-6xl px-4 py-16 sm:px-6 lg:px-8">
        <PublicErrorState />
      </div>
    );
  }
}
