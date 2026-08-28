import { buttonVariants } from "@platform/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@platform/ui/components/card";
import { ArrowRight, BookOpen, CalendarDays, Newspaper } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { MyBootcampCard } from "@/components/mentee/my-bootcamp-card";
import { SuperadminDashboard } from "@/components/admin/superadmin-dashboard";
import { MentorDashboard } from "@/components/mentor/mentor-dashboard";
import { CooDashboard } from "@/components/operations/coo-dashboard";
import { CmoDashboard } from "@/components/marketing/cmo-dashboard";
import { CeoDashboard } from "@/components/executive/ceo-dashboard";
import { PageHeading } from "@/components/public/page-heading";
import { PublicEmptyState, PublicErrorState } from "@/components/public/public-states";
import { listMyBootcamps } from "@/lib/api/mentee";
import type { MenteePage, MyBootcampEnrollment } from "@/lib/api/mentee-types";
import { authenticatedRequestInit, getServerAuthContext } from "@/lib/server-auth";

export const metadata: Metadata = { title: "Dashboard" };

const discovery = [
  {
    href: "/bootcamps",
    title: "Browse Bootcamps",
    description: "Explore published ResearchGap programs.",
    icon: BookOpen,
  },
  {
    href: "/content",
    title: "Research Content",
    description: "Read the latest articles, news, and announcements.",
    icon: Newspaper,
  },
  {
    href: "/webinars",
    title: "Webinars",
    description: "Find upcoming public learning sessions.",
    icon: CalendarDays,
  },
] as const;

export default async function DashboardPage() {
  const [authContext, requestInit] = await Promise.all([
    getServerAuthContext(),
    authenticatedRequestInit(),
  ]);

  if (authContext?.account.access.roleCode === "MENTOR") {
    return <MentorDashboard name={authContext.session.user.name} requestInit={requestInit} />;
  }
  if (authContext?.account.access.roleCode === "SUPERADMIN") {
    return <SuperadminDashboard name={authContext.session.user.name} requestInit={requestInit} />;
  }
  if (authContext?.account.access.roleCode === "COO") {
    return <CooDashboard name={authContext.session.user.name} requestInit={requestInit} />;
  }
  if (authContext?.account.access.roleCode === "CMO") {
    return <CmoDashboard name={authContext.session.user.name} requestInit={requestInit} />;
  }
  if (authContext?.account.access.roleCode === "CEO") {
    return <CeoDashboard name={authContext.session.user.name} requestInit={requestInit} />;
  }

  let enrollments: MenteePage<MyBootcampEnrollment> | null;
  try {
    enrollments = await listMyBootcamps({ status: "ACTIVE", limit: 3 }, requestInit);
  } catch {
    enrollments = null;
  }

  return (
    <div className="flex flex-col gap-10">
      <PageHeading
        eyebrow="Mentee dashboard"
        title={`Welcome back${authContext?.session.user.name ? `, ${authContext.session.user.name}` : ""}`}
        description="Continue your enrolled Bootcamps or discover another ResearchGap learning experience."
      />

      <section className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Continue learning</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Your currently active Bootcamp enrollments.
            </p>
          </div>
          <Link href="/my-bootcamps" className={buttonVariants({ variant: "outline" })}>
            View My Bootcamps
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Link>
        </div>
        {enrollments === null ? (
          <PublicErrorState
            title="Your Bootcamps could not be loaded"
            description="Please refresh the page or try again shortly."
          />
        ) : enrollments.items.length === 0 ? (
          <PublicEmptyState
            title="No active Bootcamp yet"
            description="Browse Bootcamps and enroll using a Mentee key to begin learning."
          />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {enrollments.items.map((enrollment) => (
              <MyBootcampCard key={enrollment.id} enrollment={enrollment} />
            ))}
          </div>
        )}
      </section>

      <section className="flex flex-col gap-5">
        <div>
          <h2 className="text-xl font-semibold">Explore ResearchGap</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Public programs and research resources available to everyone.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-3">
          {discovery.map(({ description, href, icon: Icon, title }) => (
            <Card key={href}>
              <CardHeader>
                <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon aria-hidden="true" />
                </div>
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link href={href} className={buttonVariants({ variant: "ghost", size: "sm" })}>
                  Explore
                  <ArrowRight data-icon="inline-end" aria-hidden="true" />
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </div>
  );
}
