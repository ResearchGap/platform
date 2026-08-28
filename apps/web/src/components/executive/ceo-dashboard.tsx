import { Badge } from "@platform/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@platform/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@platform/ui/components/table";
import { BookOpenCheck, CalendarClock, FileText, GraduationCap, UsersRound } from "lucide-react";
import Link from "next/link";

import { PageHeading } from "@/components/public/page-heading";
import { PublicErrorState } from "@/components/public/public-states";
import { getExecutiveSummary } from "@/lib/api/executive";
import type { ExecutiveSummary } from "@/lib/api/executive-types";
import { formatDateTime, readableLabel } from "@/lib/public-format";

interface SummaryCardProps {
  description: string;
  icon: typeof UsersRound;
  label: string;
  value: number;
}

function SummaryCard({ description, icon: Icon, label, value }: SummaryCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between gap-3">
        <div>
          <CardDescription>{label}</CardDescription>
          <CardTitle className="mt-1 text-3xl">{value}</CardTitle>
        </div>
        <Icon className="size-5 text-primary" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function BreakdownCard({
  description,
  items,
  title,
}: {
  description: string;
  items: ReadonlyArray<{ label: string; value: number }>;
  title: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex items-center justify-between gap-4 border-b pb-3 last:border-0 last:pb-0"
          >
            <span className="text-sm text-muted-foreground">{item.label}</span>
            <span className="font-semibold tabular-nums">{item.value}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

function TopBootcampsTable({
  bootcamps,
}: {
  bootcamps: ExecutiveSummary["enrollments"]["topBootcamps"];
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Bootcamps by participation</CardTitle>
        <CardDescription>
          Published and completed programs with the most enrollments.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {bootcamps.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No Bootcamp enrollments are available yet.
          </p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bootcamp</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead className="text-right">Participants</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bootcamps.map((bootcamp) => (
                <TableRow key={bootcamp.id}>
                  <TableCell className="font-medium">
                    <Link href={`/bootcamps/${bootcamp.slug}`}>{bootcamp.title}</Link>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{readableLabel(bootcamp.status)}</Badge>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {formatDateTime(bootcamp.startDate)}
                  </TableCell>
                  <TableCell className="text-right font-semibold tabular-nums">
                    {bootcamp.participantCount}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}

function ActivityCards({ activity }: { activity: ExecutiveSummary["activity"] }) {
  return (
    <section className="grid gap-6 xl:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Webinars</CardTitle>
          <CardDescription>Next published Webinar sessions.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {activity.upcomingWebinars.length === 0 ? (
            <p className="text-sm text-muted-foreground">No upcoming Webinar is published.</p>
          ) : (
            activity.upcomingWebinars.map((webinar) => (
              <div
                key={webinar.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <Link href={`/webinars/${webinar.slug}`} className="font-medium">
                    {webinar.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(webinar.scheduledAt)}
                  </p>
                </div>
                <Badge variant="secondary">{readableLabel(webinar.sessionType)}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Recently published Content</CardTitle>
          <CardDescription>Latest ResearchGap public publications.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {activity.recentlyPublishedContent.length === 0 ? (
            <p className="text-sm text-muted-foreground">No published Content is available yet.</p>
          ) : (
            activity.recentlyPublishedContent.map((content) => (
              <div
                key={content.id}
                className="flex flex-wrap items-center justify-between gap-3 border-b pb-4 last:border-0 last:pb-0"
              >
                <div className="min-w-0">
                  <Link href={`/content/${content.slug}`} className="font-medium">
                    {content.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {formatDateTime(content.publishedAt)}
                  </p>
                </div>
                <Badge variant="secondary">{readableLabel(content.type)}</Badge>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </section>
  );
}

export async function CeoDashboard({
  name,
  requestInit,
}: {
  name: string;
  requestInit: RequestInit;
}) {
  const summary = await getExecutiveSummary(requestInit).catch(() => null);
  if (!summary) {
    return (
      <PublicErrorState
        title="Executive summary could not be loaded"
        description="Please refresh the page or try again shortly."
      />
    );
  }

  const summaryCards: SummaryCardProps[] = [
    {
      label: "Application users",
      value: summary.users.total,
      description: `${summary.users.byAccountStatus.ACTIVE} active accounts`,
      icon: UsersRound,
    },
    {
      label: "Bootcamps",
      value: summary.bootcamps.total,
      description: `${summary.bootcamps.upcoming} upcoming · ${summary.bootcamps.ongoing} ongoing`,
      icon: BookOpenCheck,
    },
    {
      label: "Webinars",
      value: summary.webinars.total,
      description: `${summary.webinars.upcoming} upcoming published sessions`,
      icon: CalendarClock,
    },
    {
      label: "Enrollments",
      value: summary.enrollments.total,
      description: `${summary.enrollments.byStatus.ACTIVE} active · ${summary.enrollments.byStatus.COMPLETED} completed`,
      icon: GraduationCap,
    },
  ];

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeading
          eyebrow="CEO executive overview"
          title={`Welcome back${name ? `, ${name}` : ""}`}
          description="Monitor ResearchGap users, programs, publications, and participation from one read-only view."
        />
        <p className="text-sm text-muted-foreground">
          Updated {formatDateTime(summary.generatedAt)}
        </p>
      </div>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
          <SummaryCard key={card.label} {...card} />
        ))}
      </section>

      <section className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
        <BreakdownCard
          title="Users"
          description="Current application-access population."
          items={[
            { label: "Mentees", value: summary.users.mentees },
            { label: "Mentors", value: summary.users.mentors },
            { label: "Staff", value: summary.users.staff },
            { label: "Pending", value: summary.users.byAccountStatus.PENDING },
          ]}
        />
        <BreakdownCard
          title="Bootcamps"
          description="Program lifecycle distribution."
          items={[
            { label: "Draft", value: summary.bootcamps.byStatus.DRAFT },
            { label: "In review", value: summary.bootcamps.byStatus.REVIEW },
            { label: "Published", value: summary.bootcamps.byStatus.PUBLISHED },
            { label: "Completed", value: summary.bootcamps.byStatus.COMPLETED },
          ]}
        />
        <BreakdownCard
          title="Webinars"
          description="Published activity and lifecycle state."
          items={[
            { label: "Upcoming", value: summary.webinars.upcoming },
            { label: "Draft", value: summary.webinars.byStatus.DRAFT },
            { label: "Published", value: summary.webinars.byStatus.PUBLISHED },
            { label: "Completed", value: summary.webinars.byStatus.COMPLETED },
          ]}
        />
        <BreakdownCard
          title="Research Content"
          description={`${summary.content.total} total publications and drafts.`}
          items={[
            { label: "Published", value: summary.content.byStatus.PUBLISHED },
            { label: "Draft", value: summary.content.byStatus.DRAFT },
            { label: "Articles", value: summary.content.byType.ARTICLE },
            { label: "News", value: summary.content.byType.NEWS },
            { label: "Announcements", value: summary.content.byType.ANNOUNCEMENT },
          ]}
        />
      </section>

      <TopBootcampsTable bootcamps={summary.enrollments.topBootcamps} />
      <ActivityCards activity={summary.activity} />

      <Card>
        <CardHeader className="flex-row items-center gap-3">
          <FileText className="size-5 text-primary" aria-hidden="true" />
          <div>
            <CardTitle className="text-base">Read-only executive access</CardTitle>
            <CardDescription>
              This dashboard provides platform oversight without operational mutation controls.
            </CardDescription>
          </div>
        </CardHeader>
      </Card>
    </div>
  );
}
