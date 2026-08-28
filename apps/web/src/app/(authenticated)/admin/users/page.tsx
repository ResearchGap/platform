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

import { AccountStatusBadge, ApprovalStatusBadge } from "@/components/admin/account-status-badge";
import { RoleBadge } from "@/components/auth/role-badge";
import { LoadMoreLink } from "@/components/public/load-more-link";
import { PageHeading } from "@/components/public/page-heading";
import { PublicEmptyState, PublicErrorState } from "@/components/public/public-states";
import { listAdminUsers } from "@/lib/api/admin";
import { authenticatedRequestInit } from "@/lib/server-auth";

export const metadata: Metadata = { title: "User accounts" };
const roles = ["MENTEE", "MENTOR", "CEO", "COO", "CMO", "SUPERADMIN"] as const;
const accountStatuses = ["PENDING", "ACTIVE", "SUSPENDED", "DISABLED"] as const;
const approvalStatuses = ["PENDING", "APPROVED", "REJECTED"] as const;

export default async function UsersPage({
  searchParams,
}: {
  searchParams: Promise<{
    accountStatus?: string;
    approvalStatus?: string;
    cursor?: string;
    roleCode?: string;
  }>;
}) {
  const query = await searchParams;
  const roleCode = roles.find((item) => item === query.roleCode);
  const accountStatus = accountStatuses.find((item) => item === query.accountStatus);
  const approvalStatus = approvalStatuses.find((item) => item === query.approvalStatus);
  let page = null;
  try {
    page = await listAdminUsers(
      { accountStatus, approvalStatus, cursor: query.cursor, roleCode },
      await authenticatedRequestInit(),
    );
  } catch {}

  return (
    <div className="flex flex-col gap-8">
      <PageHeading
        eyebrow="Superadmin"
        title="Users"
        description="Inspect application identities, access profiles, account states, and permission overrides."
      />
      <form
        className="flex flex-wrap items-end gap-3 rounded-xl border bg-card p-4"
        action="/admin/users"
      >
        <FilterSelect label="Role" name="roleCode" value={roleCode} options={roles} />
        <FilterSelect
          label="Account status"
          name="accountStatus"
          value={accountStatus}
          options={accountStatuses}
        />
        <FilterSelect
          label="Approval status"
          name="approvalStatus"
          value={approvalStatus}
          options={approvalStatuses}
        />
        <button className={buttonVariants({ variant: "outline" })} type="submit">
          Apply filters
        </button>
      </form>
      {!page ? (
        <PublicErrorState title="Users could not be loaded" />
      ) : page.items.length === 0 ? (
        <PublicEmptyState title="No matching users" />
      ) : (
        <>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Access profile</TableHead>
                    <TableHead>Account</TableHead>
                    <TableHead>Approval</TableHead>
                    <TableHead>Overrides</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {page.items.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-muted-foreground">{user.email}</p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <RoleBadge role={user.access.roleCode} />
                      </TableCell>
                      <TableCell className="font-mono text-xs">
                        {user.access.accessProfileCode}
                      </TableCell>
                      <TableCell>
                        <AccountStatusBadge status={user.access.accountStatus} />
                      </TableCell>
                      <TableCell>
                        {user.approval ? (
                          <ApprovalStatusBadge status={user.approval.status} />
                        ) : (
                          <span className="text-muted-foreground">Not required</span>
                        )}
                      </TableCell>
                      <TableCell>{user.overrideCount}</TableCell>
                      <TableCell className="text-right">
                        <Link
                          href={`/admin/users/${user.id}` as Route}
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
            pathname={"/admin/users" as Route}
            query={{ roleCode, accountStatus, approvalStatus }}
          />
        </>
      )}
    </div>
  );
}

function FilterSelect<T extends string>({
  label,
  name,
  options,
  value,
}: {
  label: string;
  name: string;
  options: readonly T[];
  value?: T;
}) {
  return (
    <label className="grid gap-1.5 text-sm font-medium">
      {label}
      <select
        name={name}
        defaultValue={value ?? ""}
        className="h-10 rounded-md border bg-background px-3 font-normal"
      >
        <option value="">All</option>
        {options.map((item) => (
          <option key={item}>{item}</option>
        ))}
      </select>
    </label>
  );
}
