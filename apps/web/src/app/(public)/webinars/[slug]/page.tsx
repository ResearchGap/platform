import { Badge } from "@platform/ui/components/badge";
import { buttonVariants } from "@platform/ui/components/button";
import { ArrowLeft, ArrowUpRight, CalendarDays, MapPin, UserRound } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MediaCover } from "@/components/public/media-cover";
import { PublicErrorState } from "@/components/public/public-states";
import { PublicApiError } from "@/lib/api/client";
import { getPublicWebinar } from "@/lib/api/public";
import { formatDateTime, readableLabel, safeExternalUrl } from "@/lib/public-format";

type DetailProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: DetailProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const webinar = await getPublicWebinar(slug);
    return { title: webinar.title, description: webinar.description.slice(0, 160) };
  } catch {
    return { title: "Webinar" };
  }
}

export default async function WebinarDetailPage({ params }: DetailProps) {
  const { slug } = await params;
  try {
    const webinar = await getPublicWebinar(slug);
    const registrationUrl = safeExternalUrl(webinar.registrationUrl);

    return (
      <article className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <Link
          href="/webinars"
          className={buttonVariants({ variant: "ghost", size: "sm", className: "self-start" })}
        >
          <ArrowLeft data-icon="inline-start" aria-hidden="true" />
          All webinars
        </Link>
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-start">
          <div className="flex flex-col gap-6">
            <div className="overflow-hidden rounded-xl border">
              <MediaCover alt={webinar.title} src={webinar.cover?.externalUrl} />
            </div>
            <div className="flex flex-col gap-4">
              <div className="flex flex-wrap gap-2">
                <Badge variant="secondary">{readableLabel(webinar.sessionType)}</Badge>
                <Badge variant={webinar.status === "COMPLETED" ? "outline" : "secondary"}>
                  {readableLabel(webinar.status)}
                </Badge>
              </div>
              <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-5xl">
                {webinar.title}
              </h1>
              <p className="whitespace-pre-wrap text-base leading-8 text-muted-foreground">
                {webinar.description}
              </p>
            </div>
          </div>
          <aside className="flex flex-col gap-5 rounded-xl border bg-card p-6">
            <h2 className="text-lg font-semibold">Webinar information</h2>
            <dl className="flex flex-col gap-4 text-sm">
              <div className="flex items-start gap-3">
                <CalendarDays className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                <div>
                  <dt className="font-medium">Schedule</dt>
                  <dd className="mt-1 text-muted-foreground">
                    {formatDateTime(webinar.scheduledAt)}
                  </dd>
                </div>
              </div>
              {webinar.speakerName ? (
                <div className="flex items-start gap-3">
                  <UserRound className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <dt className="font-medium">Speaker</dt>
                    <dd className="mt-1 text-muted-foreground">{webinar.speakerName}</dd>
                  </div>
                </div>
              ) : null}
              {webinar.venue ? (
                <div className="flex items-start gap-3">
                  <MapPin className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
                  <div>
                    <dt className="font-medium">Venue</dt>
                    <dd className="mt-1 text-muted-foreground">{webinar.venue}</dd>
                  </div>
                </div>
              ) : null}
            </dl>
            {registrationUrl ? (
              <a
                href={registrationUrl}
                target="_blank"
                rel="noreferrer"
                className={buttonVariants({ variant: "brand", size: "lg", className: "w-full" })}
              >
                Register externally
                <ArrowUpRight data-icon="inline-end" aria-hidden="true" />
              </a>
            ) : (
              <p className="rounded-lg bg-muted p-3 text-sm text-muted-foreground">
                External registration is not available yet.
              </p>
            )}
          </aside>
        </div>
      </article>
    );
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) {
      notFound();
    }
    return (
      <div className="mx-auto w-full max-w-5xl px-4 py-16 sm:px-6 lg:px-8">
        <PublicErrorState />
      </div>
    );
  }
}
