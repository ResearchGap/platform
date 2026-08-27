import { Badge } from "@platform/ui/components/badge";
import { buttonVariants } from "@platform/ui/components/button";
import { ArrowLeft, CalendarRange } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { LearningSessionCard } from "@/components/mentee/learning-session-card";
import { MediaCover } from "@/components/public/media-cover";
import { PublicEmptyState, PublicErrorState } from "@/components/public/public-states";
import { ApiError } from "@/lib/api/client";
import { getMyLearningAccess } from "@/lib/api/mentee";
import type { LearningBootcampAccess } from "@/lib/api/mentee-types";
import { formatDate, readableLabel } from "@/lib/public-format";
import { authenticatedRequestInit } from "@/lib/server-auth";

export const metadata: Metadata = { title: "Bootcamp learning" };

export default async function LearningAccessPage({
  params,
}: {
  params: Promise<{ bootcampId: string }>;
}) {
  const { bootcampId } = await params;
  let access: LearningBootcampAccess;
  try {
    access = await getMyLearningAccess(bootcampId, await authenticatedRequestInit());
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    if (error instanceof ApiError && error.status === 403) {
      return (
        <PublicErrorState
          title="Learning access denied"
          description="An active enrollment is required to access these sessions and resources."
        />
      );
    }
    return (
      <PublicErrorState
        title="Learning resources could not be loaded"
        description="Please refresh the page or try again shortly."
      />
    );
  }

  return (
    <div className="flex flex-col gap-8">
      <Link
        href="/my-bootcamps"
        className={buttonVariants({ variant: "ghost", size: "sm", className: "self-start" })}
      >
        <ArrowLeft data-icon="inline-start" aria-hidden="true" />
        My Bootcamps
      </Link>
      <section className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr] lg:items-start">
        <div className="overflow-hidden rounded-xl border">
          <MediaCover alt={access.bootcamp.title} src={access.bootcamp.cover?.externalUrl} />
        </div>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap gap-2">
            <Badge variant="secondary">{readableLabel(access.enrollment.status)}</Badge>
            <Badge variant="outline">{readableLabel(access.bootcamp.status)}</Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-balance">
            {access.bootcamp.title}
          </h1>
          <p className="whitespace-pre-wrap text-sm leading-7 text-muted-foreground">
            {access.bootcamp.description}
          </p>
          <p className="flex items-center gap-2 text-sm font-medium">
            <CalendarRange className="size-4 text-primary" aria-hidden="true" />
            {formatDate(access.bootcamp.startDate)} – {formatDate(access.bootcamp.endDate)}
          </p>
        </div>
      </section>

      <section className="flex flex-col gap-5">
        <div>
          <h2 className="text-xl font-semibold">Sessions and resources</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            External learning, test, feedback, meeting, and recording links supplied by the
            organizer.
          </p>
        </div>
        {access.sessions.length === 0 ? (
          <PublicEmptyState
            title="No sessions available"
            description="Session information will appear here when the organizer adds it."
          />
        ) : (
          <div className="flex flex-col gap-4">
            {access.sessions.map((session) => (
              <LearningSessionCard key={session.id} session={session} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
