import type {
  AccountStatus,
  AuthorizationActor,
  RoleCode,
} from "../../authorization/authorization.types.js";
import type {
  AdminApprovalSummary,
  AdminDashboardSummary,
  AdminPage,
  AdminUserDetail,
  AdminUserSummary,
  ApprovalDecision,
  ApprovalReviewResult,
  ApprovalStatus,
  CreatePermissionOverrideInput,
  CurrentAccountDetail,
  UpdateUserProfileInput,
  UserProfileDetail,
} from "./identity.types.js";

export interface IdentityAccessRepository {
  bootstrapSuperadmin(email: string): Promise<{ email: string; userId: string }>;
  findActor(userId: string): Promise<AuthorizationActor | null>;
  initializeMentee(userId: string): Promise<void>;
  initializePendingRegistration(userId: string, roleCode: RoleCode): Promise<void>;
  reviewApproval(input: {
    approvalId: string;
    decision: ApprovalDecision;
    reviewNote?: string;
    reviewerId: string;
  }): Promise<ApprovalReviewResult>;
}

export interface CurrentAccountRepository {
  findCurrentAccount(userId: string): Promise<CurrentAccountDetail | null>;
  updateProfile(userId: string, input: UpdateUserProfileInput): Promise<UserProfileDetail>;
}

export interface IdentityAdministrationRepository {
  createPermissionOverride(
    actorId: string,
    userId: string,
    input: CreatePermissionOverrideInput,
  ): Promise<AdminUserDetail>;
  deletePermissionOverride(userId: string, overrideId: string): Promise<void>;
  findAdminApproval(approvalId: string): Promise<AdminApprovalSummary | null>;
  findAdminUser(userId: string): Promise<AdminUserDetail | null>;
  getAdminDashboardSummary(): Promise<AdminDashboardSummary>;
  listAdminApprovals(input: {
    cursor?: string;
    limit: number;
    requestedRoleCode?: RoleCode;
    status?: ApprovalStatus;
  }): Promise<AdminPage<AdminApprovalSummary>>;
  listAdminUsers(input: {
    accountStatus?: AccountStatus;
    approvalStatus?: ApprovalStatus;
    cursor?: string;
    limit: number;
    roleCode?: RoleCode;
  }): Promise<AdminPage<AdminUserSummary>>;
  updateAdminAccountStatus(userId: string, status: AccountStatus): Promise<AdminUserDetail>;
  updateAdminRole(userId: string, roleCode: RoleCode): Promise<AdminUserDetail>;
}
