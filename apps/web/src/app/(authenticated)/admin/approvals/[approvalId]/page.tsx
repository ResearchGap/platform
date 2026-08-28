import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@platform/ui/components/card";
import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ApprovalReviewActions } from "@/components/admin/approval-review-actions";
import { ApprovalStatusBadge } from "@/components/admin/account-status-badge";
import { RoleBadge } from "@/components/auth/role-badge";
import { PageHeading } from "@/components/public/page-heading";
import { getAdminApproval } from "@/lib/api/admin";
import type { AdminApproval } from "@/lib/api/admin-types";
import { ApiError } from "@/lib/api/client";
import { formatDateTime } from "@/lib/public-format";
import { authenticatedRequestInit } from "@/lib/server-auth";

export const metadata: Metadata = { title: "Approval detail" };

export default async function ApprovalDetailPage({
  params,
}: {
  params: Promise<{ approvalId: string }>;
}) {
  const { approvalId } = await params;
  let approval: AdminApproval;
  try {
    approval = await getAdminApproval(approvalId, await authenticatedRequestInit());
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }
  const profile = approval.user.profile;

  return (
    <div className="flex max-w-5xl flex-col gap-8">
      <PageHeading
        eyebrow="Account approval"
        title={approval.user.name}
        description={approval.user.email}
      />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Application</CardTitle>
            <CardDescription>Submitted {formatDateTime(approval.createdAt)}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4">
            <Detail label="Requested role">
              <RoleBadge role={approval.requestedRoleCode} />
            </Detail>
            <Detail label="Approval status">
              <ApprovalStatusBadge status={approval.status} />
            </Detail>
            {approval.reviewedAt ? (
              <Detail label="Reviewed">
                {formatDateTime(approval.reviewedAt)}
                {approval.reviewer ? ` by ${approval.reviewer.name}` : ""}
              </Detail>
            ) : null}
            {approval.reviewNote ? (
              <Detail label="Review note">{approval.reviewNote}</Detail>
            ) : null}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Applicant profile</CardTitle>
            <CardDescription>Application profile information currently available.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 sm:grid-cols-2">
            <Detail label="Nickname">{profile?.nickname || "Not provided"}</Detail>
            <Detail label="Institution">{profile?.institution || "Not provided"}</Detail>
            <Detail label="Affiliation">{profile?.affiliation || "Not provided"}</Detail>
            <Detail label="Research field">{profile?.researchField || "Not provided"}</Detail>
            <Detail label="Expertise">{profile?.expertise || "Not provided"}</Detail>
            <Detail label="WhatsApp">{profile?.whatsapp || "Not provided"}</Detail>
            <Detail label="Biography">{profile?.biography || "Not provided"}</Detail>
          </CardContent>
        </Card>
      </div>
      {approval.status === "PENDING" ? (
        <Card>
          <CardHeader>
            <CardTitle>Review application</CardTitle>
            <CardDescription>
              Approval activates the account using the requested role and its centrally mapped
              access profile.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ApprovalReviewActions approvalId={approval.id} />
          </CardContent>
        </Card>
      ) : null}
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
