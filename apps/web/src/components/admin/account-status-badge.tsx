import { Badge } from "@platform/ui/components/badge";

import type { AccountStatus, ApprovalStatus } from "@/lib/api/mentee-types";

const accountVariants: Record<AccountStatus, React.ComponentProps<typeof Badge>["variant"]> = {
  ACTIVE: "success",
  DISABLED: "destructive",
  PENDING: "warning",
  SUSPENDED: "secondary",
};

const approvalVariants: Record<ApprovalStatus, React.ComponentProps<typeof Badge>["variant"]> = {
  APPROVED: "success",
  PENDING: "warning",
  REJECTED: "destructive",
};

export function AccountStatusBadge({ status }: { status: AccountStatus }) {
  return <Badge variant={accountVariants[status]}>{status}</Badge>;
}

export function ApprovalStatusBadge({ status }: { status: ApprovalStatus }) {
  return <Badge variant={approvalVariants[status]}>{status}</Badge>;
}
