import { buttonVariants } from "@platform/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@platform/ui/components/card";
import { ArrowRight, CalendarDays, FilePlus2, KeyRound, Plus } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";

import { PageHeading } from "@/components/public/page-heading";
import { PublicEmptyState } from "@/components/public/public-states";
import {
  listBootcampSessions,
  listManagedBootcamps,
  listManagedContent,
  listManagedWebinars,
} from "@/lib/api/mentor";
import { formatDateTime } from "@/lib/public-format";

import { ManagedContentCard } from "./managed-content-card";
import { ManagedWebinarCard } from "./managed-webinar-card";
import { MentorBootcampCard } from "./mentor-bootcamp-card";

export async function MentorDashboard({
  name,
  requestInit,
}: {
  name: string;
  requestInit: RequestInit;
}) {
  const [bootcampResult, contentResult, webinarResult] = await Promise.allSettled([
    listManagedBootcamps({ limit: 3 }, requestInit),
    listManagedContent({ limit: 3 }, requestInit),
    listManagedWebinars({ limit: 3 }, requestInit),
  ]);
  const bootcamps = bootcampResult.status === "fulfilled" ? bootcampResult.value.items : [];
  const content = contentResult.status === "fulfilled" ? contentResult.value.items : [];
  const webinars = webinarResult.status === "fulfilled" ? webinarResult.value.items : [];
  const sessionResults = await Promise.allSettled(
    bootcamps.map((item) => listBootcampSessions(item.id, requestInit)),
  );
  const upcoming = sessionResults
    .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
    .filter((session) => new Date(session.scheduledAt) >= new Date())
    .sort((a, b) => a.scheduledAt.localeCompare(b.scheduledAt))
    .slice(0, 4);

  return (
    <div className="flex flex-col gap-10">
      <PageHeading
        eyebrow="Mentor dashboard"
        title={`Welcome back${name ? `, ${name}` : ""}`}
        description="Manage assigned Bootcamps, learning sessions, Research Content, and Webinars."
      />
      <div className="flex flex-wrap gap-3">
        <Link href="/mentor/bootcamps/new" className={buttonVariants({ variant: "brand" })}>
          <Plus data-icon="inline-start" aria-hidden="true" />
          Create Bootcamp
        </Link>
        <Link href="/mentor/bootcamps/join" className={buttonVariants({ variant: "outline" })}>
          <KeyRound data-icon="inline-start" aria-hidden="true" />
          Join with key
        </Link>
        <Link href="/mentor/content/new" className={buttonVariants({ variant: "outline" })}>
          <FilePlus2 data-icon="inline-start" aria-hidden="true" />
          Create content
        </Link>
      </div>
      <DashboardSection title="Assigned Bootcamps" href="/mentor/bootcamps">
        {bootcamps.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {bootcamps.map((item) => (
              <MentorBootcampCard key={item.id} bootcamp={item} />
            ))}
          </div>
        ) : (
          <PublicEmptyState
            title="No assigned Bootcamps"
            description="Create a Bootcamp or join one with a Mentor enrollment key."
          />
        )}
      </DashboardSection>
      <DashboardSection title="Upcoming sessions" href="/mentor/bootcamps">
        {upcoming.length ? (
          <div className="grid gap-4 sm:grid-cols-2">
            {upcoming.map((session) => (
              <Card key={session.id}>
                <CardHeader>
                  <CardTitle className="text-base">{session.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarDays aria-hidden="true" />
                  {formatDateTime(session.scheduledAt)}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <PublicEmptyState
            title="No upcoming sessions"
            description="Upcoming sessions from your assigned Bootcamps will appear here."
          />
        )}
      </DashboardSection>
      <div className="grid gap-8 xl:grid-cols-2">
        <DashboardSection title="Managed content" href="/mentor/content">
          {content.length ? (
            <div className="grid gap-4">
              {content.map((item) => (
                <ManagedContentCard key={item.id} content={item} />
              ))}
            </div>
          ) : (
            <PublicEmptyState title="No content drafts" />
          )}
        </DashboardSection>
        <DashboardSection title="Managed Webinars" href="/mentor/webinars">
          {webinars.length ? (
            <div className="grid gap-4">
              {webinars.map((item) => (
                <ManagedWebinarCard key={item.id} webinar={item} />
              ))}
            </div>
          ) : (
            <PublicEmptyState title="No managed Webinars" />
          )}
        </DashboardSection>
      </div>
    </div>
  );
}

function DashboardSection({
  children,
  href,
  title,
}: {
  children: React.ReactNode;
  href: Route;
  title: string;
}) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-xl font-semibold">{title}</h2>
        <Link href={href} className={buttonVariants({ variant: "ghost", size: "sm" })}>
          View all
          <ArrowRight data-icon="inline-end" aria-hidden="true" />
        </Link>
      </div>
      {children}
    </section>
  );
}
