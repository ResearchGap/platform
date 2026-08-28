import { buttonVariants } from "@platform/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@platform/ui/components/card";
import { ShieldCheck, UserCheck, UserX, UsersRound } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";

import { getAdminDashboard } from "@/lib/api/admin";
import { readableLabel } from "@/lib/public-format";

import { RoleBadge } from "../auth/role-badge";
import { PageHeading } from "../public/page-heading";
import { PublicErrorState } from "../public/public-states";

export async function SuperadminDashboard({
  name,
  requestInit,
}: {
  name: string;
  requestInit: RequestInit;
}) {
  try {
    const summary = await getAdminDashboard(requestInit);
    const inactive = summary.accountStatuses.SUSPENDED + summary.accountStatuses.DISABLED;
    const cards = [
      { label: "Pending Mentors", value: summary.pendingMentorApprovals, icon: ShieldCheck },
      { label: "Pending Staff", value: summary.pendingStaffApprovals, icon: UsersRound },
      { label: "Active users", value: summary.accountStatuses.ACTIVE, icon: UserCheck },
      { label: "Suspended / disabled", value: inactive, icon: UserX },
    ];

    return (
      <div className="flex flex-col gap-10">
        <PageHeading
          eyebrow="Superadmin operations"
          title={`Welcome back${name ? `, ${name}` : ""}`}
          description="Review pending applications and manage ResearchGap application access."
        />
        <div className="flex flex-wrap gap-3">
          <Link href={"/admin/approvals" as Route} className={buttonVariants({ variant: "brand" })}>
            Review approvals
          </Link>
          <Link href={"/admin/users" as Route} className={buttonVariants({ variant: "outline" })}>
            Manage users
          </Link>
        </div>
        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {cards.map(({ icon: Icon, label, value }) => (
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
        <section className="grid gap-6 xl:grid-cols-[1.3fr_1fr]">
          <Card>
            <CardHeader>
              <CardTitle>Role distribution</CardTitle>
              <CardDescription>{summary.totalUsers} application users</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-3 sm:grid-cols-2">
              {Object.entries(summary.roleDistribution).map(([role, count]) => (
                <div
                  key={role}
                  className="flex items-center justify-between gap-3 rounded-lg border p-3"
                >
                  <RoleBadge role={role as keyof typeof summary.roleDistribution} />
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Account states</CardTitle>
              <CardDescription>Current application-access distribution</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {Object.entries(summary.accountStatuses).map(([status, count]) => (
                <div
                  key={status}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <span className="text-sm text-muted-foreground">{readableLabel(status)}</span>
                  <span className="font-semibold">{count}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </section>
      </div>
    );
  } catch {
    return (
      <PublicErrorState
        title="Administrative summary could not be loaded"
        description="Please refresh the page or try again shortly."
      />
    );
  }
}
