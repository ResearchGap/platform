import { buttonVariants } from "@platform/ui/components/button";
import { Card, CardContent } from "@platform/ui/components/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@platform/ui/components/table";
import type { Metadata, Route } from "next";
import Link from "next/link";

import { ApprovalStatusBadge } from "@/components/admin/account-status-badge";
import { RoleBadge } from "@/components/auth/role-badge";
import { LoadMoreLink } from "@/components/public/load-more-link";
import { PageHeading } from "@/components/public/page-heading";
import { PublicEmptyState, PublicErrorState } from "@/components/public/public-states";
import { listAdminApprovals } from "@/lib/api/admin";
import { formatDate } from "@/lib/public-format";
import { authenticatedRequestInit } from "@/lib/server-auth";

export const metadata: Metadata = { title: "Account approvals" };
const statuses = ["PENDING", "APPROVED", "REJECTED"] as const;
const requestedRoles = ["MENTOR", "CEO", "COO", "CMO"] as const;

export default async function ApprovalsPage({
  searchParams,
}: {
  searchParams: Promise<{ cursor?: string; requestedRoleCode?: string; status?: string }>;
}) {
  const query = await searchParams;
  const status = statuses.find((item) => item === query.status) ?? "PENDING";
  const requestedRoleCode = requestedRoles.find((item) => item === query.requestedRoleCode);
  let page = null;
  try {
    page = await listAdminApprovals(
      { cursor: query.cursor, requestedRoleCode, status },
      await authenticatedRequestInit(),
    );
  } catch {}

  return (
    <div className="flex flex-col gap-8">
      <PageHeading
        eyebrow="Superadmin"
        title="Account approvals"
        description="Review Mentor and Staff applications before granting application access."
      />
      <form
        className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4"
        action="/admin/approvals"
      >
        <label className="grid gap-1.5 text-sm font-medium">
          Status
          <select
            name="status"
            defaultValue={status}
            className="h-10 rounded-md border bg-background px-3 font-normal"
          >
            {statuses.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-medium">
          Requested role
          <select
            name="requestedRoleCode"
            defaultValue={requestedRoleCode ?? ""}
            className="h-10 rounded-md border bg-background px-3 font-normal"
          >
            <option value="">All roles</option>
            {requestedRoles.map((item) => (
              <option key={item}>{item}</option>
            ))}
          </select>
        </label>
        <button className={buttonVariants({ variant: "outline" })} type="submit">
          Apply filters
        </button>
      </form>
      {!page ? (
        <PublicErrorState title="Approvals could not be loaded" />
      ) : page.items.length === 0 ? (
        <PublicEmptyState title="No matching approvals" />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Applicant</TableHead>
                    <TableHead>Requested role</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Submitted</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {page.items.map((approval) => (
                    <TableRow key={approval.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{approval.user.name}</p>
                          <p className="text-muted-foreground">{approval.user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={approval.requestedRoleCode} />
                      </TableCell>
                      <TableCell>
                        <ApprovalStatusBadge status={approval.status} />
                      </TableCell>
                      <TableCell>{formatDate(approval.createdAt)}</TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/admin/approvals/${approval.id}` as Route}
                          className={buttonVariants({ variant: "ghost", size: "sm" })}
                        >
                          View
                        </Link>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <LoadMoreLink
            cursor={page.nextCursor}
            pathname={"/admin/approvals" as Route}
            query={{ status, requestedRoleCode }}
          />
        </>
      )}
    </div>
  );
}
