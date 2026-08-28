import type { AccountStatus, ApprovalStatus, RoleCode } from "./mentee-types";
import { apiRequest } from "./client";
import type {
  AdminApproval,
  AdminDashboardSummary,
  AdminPage,
  AdminUserDetail,
  AdminUserSummary,
  PermissionEffect,
} from "./admin-types";

export function getAdminDashboard(init: RequestInit = {}) {
  return apiRequest<AdminDashboardSummary>("/api/admin/summary", { cache: "no-store", ...init });
}

export function listAdminApprovals(
  query: { cursor?: string; requestedRoleCode?: RoleCode; status?: ApprovalStatus },
  init: RequestInit = {},
) {
  return apiRequest<AdminPage<AdminApproval>>(
    "/api/admin/approvals",
    { cache: "no-store", ...init },
    query,
  );
}

export function getAdminApproval(approvalId: string, init: RequestInit = {}) {
  return apiRequest<AdminApproval>(`/api/admin/approvals/${approvalId}`, {
    cache: "no-store",
    ...init,
  });
}

export function reviewAccountApproval(
  approvalId: string,
  input: { decision: "APPROVE" | "REJECT"; reviewNote?: string },
) {
  return apiRequest(`/api/account-approvals/${approvalId}/review`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function listAdminUsers(
  query: {
    accountStatus?: AccountStatus;
    approvalStatus?: ApprovalStatus;
    cursor?: string;
    roleCode?: RoleCode;
  },
  init: RequestInit = {},
) {
  return apiRequest<AdminPage<AdminUserSummary>>(
    "/api/admin/users",
    { cache: "no-store", ...init },
    query,
  );
}

export function getAdminUser(userId: string, init: RequestInit = {}) {
  return apiRequest<AdminUserDetail>(`/api/admin/users/${userId}`, { cache: "no-store", ...init });
}

export function updateAdminAccountStatus(
  userId: string,
  status: Exclude<AccountStatus, "PENDING">,
) {
  return apiRequest<AdminUserDetail>(`/api/admin/users/${userId}/status`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ status }),
  });
}

export function updateAdminRole(userId: string, roleCode: Exclude<RoleCode, "SUPERADMIN">) {
  return apiRequest<AdminUserDetail>(`/api/admin/users/${userId}/role`, {
    method: "PATCH",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ roleCode }),
  });
}

export function listPermissionCatalog(init: RequestInit = {}) {
  return apiRequest<{ items: string[] }>("/api/admin/permissions", { cache: "no-store", ...init });
}

export function createPermissionOverride(
  userId: string,
  input: {
    effect: PermissionEffect;
    expiresAt?: string;
    permissionKey: string;
    reason?: string;
  },
) {
  return apiRequest<AdminUserDetail>(`/api/admin/users/${userId}/permission-overrides`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function deletePermissionOverride(userId: string, overrideId: string) {
  return apiRequest<void>(`/api/admin/users/${userId}/permission-overrides/${overrideId}`, {
    method: "DELETE",
  });
}
