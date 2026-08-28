import { buttonVariants } from "@platform/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@platform/ui/components/card";
import { ArrowRight, BookOpenCheck, CalendarClock, ClipboardCheck, UsersRound } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";

import { ManagedWebinarCard } from "@/components/mentor/managed-webinar-card";
import { MentorBootcampCard } from "@/components/mentor/mentor-bootcamp-card";
import { PageHeading } from "@/components/public/page-heading";
import { PublicErrorState } from "@/components/public/public-states";
import { listManagedBootcamps, listManagedWebinars } from "@/lib/api/mentor";

export async function CooDashboard({
  name,
  requestInit,
}: {
  name: string;
  requestInit: RequestInit;
}) {
  const result = await Promise.all([
    listManagedBootcamps({ status: "REVIEW", limit: 4 }, requestInit),
    listManagedBootcamps({ status: "PUBLISHED", timing: "UPCOMING", limit: 4 }, requestInit),
    listManagedBootcamps({ status: "PUBLISHED", timing: "ONGOING", limit: 4 }, requestInit),
    listManagedWebinars({ status: "PUBLISHED", timing: "UPCOMING", limit: 4 }, requestInit),
  ]).catch(() => null);

  if (!result) return <PublicErrorState title="Operational dashboard could not be loaded" />;
  const [review, upcoming, ongoing, webinars] = result;
  const summary = [
    { label: "Awaiting review", value: countLabel(review), icon: ClipboardCheck },
    { label: "Upcoming Bootcamps", value: countLabel(upcoming), icon: BookOpenCheck },
    { label: "Ongoing Bootcamps", value: countLabel(ongoing), icon: UsersRound },
    { label: "Upcoming Webinars", value: countLabel(webinars), icon: CalendarClock },
  ];

  return (
    <div className="flex flex-col gap-10">
      <PageHeading
        eyebrow="COO operations"
        title={`Welcome back${name ? `, ${name}` : ""}`}
        description="Review programs, coordinate Mentors, and keep upcoming learning activities ready."
      />
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summary.map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardHeader className="flex-row items-center justify-between gap-3">
              <CardDescription>{label}</CardDescription>
              <Icon className="size-5 text-primary" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tracking-tight">{value}</p>
            </CardContent>
          </Card>
        ))}
      </section>
      <section className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Bootcamps requiring review</h2>
            <p className="text-sm text-muted-foreground">Review and publish submitted programs.</p>
          </div>
          <Link
            href={"/operations/bootcamps?status=REVIEW" as Route}
            className={buttonVariants({ variant: "outline" })}
          >
            View all
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Link>
        </div>
        {review.items.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Review queue is clear</CardTitle>
              <CardDescription>No Bootcamps currently require review.</CardDescription>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {review.items.map((item) => (
              <MentorBootcampCard key={item.id} bootcamp={item} basePath="/operations/bootcamps" />
            ))}
          </div>
        )}
      </section>
      <section className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Upcoming Webinars</h2>
            <p className="text-sm text-muted-foreground">Published sessions scheduled next.</p>
          </div>
          <Link
            href={"/operations/webinars" as Route}
            className={buttonVariants({ variant: "outline" })}
          >
            Manage Webinars
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Link>
        </div>
        {webinars.items.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">No upcoming Webinar</CardTitle>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {webinars.items.map((item) => (
              <ManagedWebinarCard key={item.id} webinar={item} basePath="/operations/webinars" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function countLabel(page: { items: unknown[]; nextCursor: string | null }) {
  return `${page.items.length}${page.nextCursor ? "+" : ""}`;
}
