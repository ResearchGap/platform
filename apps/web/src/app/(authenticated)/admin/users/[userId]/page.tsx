import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@platform/ui/components/card";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { AccountStatusBadge, ApprovalStatusBadge } from "@/components/admin/account-status-badge";
import { UserAdministration } from "@/components/admin/user-administration";
import { PasswordResetSupport } from "@/components/admin/password-reset-support";
import { RoleBadge } from "@/components/auth/role-badge";
import { PageHeading } from "@/components/public/page-heading";
import { getAdminUser, listPermissionCatalog } from "@/lib/api/admin";
import type { AdminUserDetail } from "@/lib/api/admin-types";
import { ApiError } from "@/lib/api/client";
import { formatDateTime } from "@/lib/public-format";
import { authenticatedRequestInit } from "@/lib/server-auth";
import { listPasswordResetRequests } from "@/lib/api/password-reset";
import type { PasswordResetRequestSummary } from "@/lib/api/password-reset";

export const metadata: Metadata = { title: "User detail" };

export default async function UserDetailPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params;
  const requestInit = await authenticatedRequestInit();
  let user: AdminUserDetail;
  let permissions: string[];
  let passwordResetRequests: PasswordResetRequestSummary[];
  try {
    [user, { items: permissions }, { items: passwordResetRequests }] = await Promise.all([
      getAdminUser(userId, requestInit),
      listPermissionCatalog(requestInit),
      listPasswordResetRequests(userId, requestInit),
    ]);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <div className="flex flex-col gap-8">
      <PageHeading eyebrow="User account" title={user.name} description={user.email} />
      <div className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Application access</CardTitle>
            <CardDescription>Created {formatDateTime(user.createdAt)}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Detail label="Role">
              <RoleBadge role={user.access.roleCode} />
            </Detail>
            <Detail label="Access profile">
              <code className="text-xs">{user.access.accessProfileCode}</code>
            </Detail>
            <Detail label="Account status">
              <AccountStatusBadge status={user.access.accountStatus} />
            </Detail>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>ResearchGap profile information</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Detail label="Nickname">{user.profile?.nickname || "Not provided"}</Detail>
            <Detail label="Institution">{user.profile?.institution || "Not provided"}</Detail>
            <Detail label="Affiliation">{user.profile?.affiliation || "Not provided"}</Detail>
            <Detail label="Research field">{user.profile?.researchField || "Not provided"}</Detail>
            <Detail label="Expertise">{user.profile?.expertise || "Not provided"}</Detail>
            <Detail label="WhatsApp">{user.profile?.whatsapp || "Not provided"}</Detail>
            <Detail label="Biography">{user.profile?.biography || "Not provided"}</Detail>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Approval</CardTitle>
            <CardDescription>Account approval record where applicable</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            {user.approval ? (
              <>
                <Detail label="Status">
                  <ApprovalStatusBadge status={user.approval.status} />
                </Detail>
                <Detail label="Requested role">
                  <RoleBadge role={user.approval.requestedRoleCode} />
                </Detail>
                {user.approval.reviewedAt ? (
                  <Detail label="Reviewed">{formatDateTime(user.approval.reviewedAt)}</Detail>
                ) : null}
                {user.approval.reviewNote ? (
                  <Detail label="Review note">{user.approval.reviewNote}</Detail>
                ) : null}
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No approval was required for this account.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
      <UserAdministration user={user} permissions={permissions} />
      <PasswordResetSupport userId={user.id} initialRequests={passwordResetRequests} />
    </div>
  );
}

function Detail({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="mt-1 text-sm">{children}</div>
    </div>
  );
}
