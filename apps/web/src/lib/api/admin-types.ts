import type { AccountStatus, ApprovalStatus, RoleCode } from "./mentee-types";

export type PermissionEffect = "ALLOW" | "DENY";

export interface AdminProfileSummary {
  affiliation: string | null;
  biography: string | null;
  expertise: string | null;
  institution: string | null;
  nickname: string | null;
  researchField: string | null;
  whatsapp: string | null;
}

export interface AdminApproval {
  createdAt: string;
  id: string;
  requestedRoleCode: RoleCode;
  reviewedAt: string | null;
  reviewNote: string | null;
  reviewer: { id: string; name: string } | null;
  status: ApprovalStatus;
  user: {
    email: string;
    id: string;
    name: string;
    profile: AdminProfileSummary | null;
  };
}

export interface AdminPermissionOverride {
  createdAt: string;
  createdBy: { id: string; name: string };
  effect: PermissionEffect;
  expiresAt: string | null;
  id: string;
  permissionKey: string;
  reason: string | null;
}

export interface AdminUserSummary {
  access: {
    accessProfileCode: string;
    accountStatus: AccountStatus;
    roleCode: RoleCode;
  };
  approval: {
    id: string;
    requestedRoleCode: RoleCode;
    status: ApprovalStatus;
  } | null;
  createdAt: string;
  email: string;
  id: string;
  image: string | null;
  name: string;
  overrideCount: number;
  profile: AdminProfileSummary | null;
}

export interface AdminUserDetail extends Omit<AdminUserSummary, "approval"> {
  approval: AdminApproval | null;
  overrides: AdminPermissionOverride[];
}

export interface AdminPage<T> {
  items: T[];
  nextCursor: string | null;
}

export interface AdminDashboardSummary {
  accountStatuses: Record<AccountStatus, number>;
  pendingMentorApprovals: number;
  pendingStaffApprovals: number;
  roleDistribution: Partial<Record<RoleCode, number>>;
  totalUsers: number;
}
