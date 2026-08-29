import { authorize } from "../../authorization/authorize.js";
import {
  ACCOUNT_STATUSES,
  ROLES,
  type AccountStatus,
  type AuthorizationActor,
  type RoleCode,
} from "../../authorization/authorization.types.js";
import { PERMISSIONS, type Permission } from "../../authorization/permissions.js";
import { InvalidAccountAdministrationError, IdentityNotFoundError } from "./identity.errors.js";
import type { IdentityAdministrationRepository } from "./identity.repository.js";
import type { ApprovalStatus, CreatePermissionOverrideInput } from "./identity.types.js";

export class IdentityAdministrationService {
  constructor(private readonly repository: IdentityAdministrationRepository) {}

  getDashboard(actor: AuthorizationActor) {
    authorize(actor, PERMISSIONS.USER_READ);
    return this.repository.getAdminDashboardSummary();
  }

  listApprovals(
    actor: AuthorizationActor,
    input: {
      cursor?: string;
      limit: number;
      requestedRoleCode?: RoleCode;
      status?: ApprovalStatus;
    },
  ) {
    authorize(actor, PERMISSIONS.USER_READ);
    return this.repository.listAdminApprovals(input);
  }

  async getApproval(actor: AuthorizationActor, approvalId: string) {
    authorize(actor, PERMISSIONS.USER_READ);
    const approval = await this.repository.findAdminApproval(approvalId);
    if (!approval) throw new IdentityNotFoundError("Approval request was not found");
    return approval;
  }

  listUsers(
    actor: AuthorizationActor,
    input: {
      accountStatus?: AccountStatus;
      approvalStatus?: ApprovalStatus;
      cursor?: string;
      limit: number;
      roleCode?: RoleCode;
    },
  ) {
    authorize(actor, PERMISSIONS.USER_READ);
    return this.repository.listAdminUsers(input);
  }

  async getUser(actor: AuthorizationActor, userId: string) {
    authorize(actor, PERMISSIONS.USER_READ);
    return this.requireUser(userId);
  }

  async updateAccountStatus(actor: AuthorizationActor, userId: string, status: AccountStatus) {
    authorize(actor, PERMISSIONS.USER_UPDATE);
    const target = await this.requireMutableUser(actor, userId);
    if (target.access.accountStatus === ACCOUNT_STATUSES.PENDING) {
      throw new InvalidAccountAdministrationError(
        "Pending accounts must be handled through approval",
      );
    }
    return this.repository.updateAdminAccountStatus(userId, status);
  }

  async updateRole(actor: AuthorizationActor, userId: string, roleCode: RoleCode) {
    authorize(actor, PERMISSIONS.USER_ASSIGN_ROLE);
    const target = await this.requireMutableUser(actor, userId);
    if (roleCode === ROLES.SUPERADMIN) {
      throw new InvalidAccountAdministrationError(
        "Superadmin provisioning is not available through account administration",
      );
    }
    if (target.access.accountStatus === ACCOUNT_STATUSES.PENDING) {
      throw new InvalidAccountAdministrationError(
        "Approve pending accounts before changing their role",
      );
    }
    return this.repository.updateAdminRole(userId, roleCode);
  }

  async createOverride(
    actor: AuthorizationActor,
    userId: string,
    input: CreatePermissionOverrideInput,
  ) {
    authorize(actor, PERMISSIONS.USER_MANAGE_PERMISSION_OVERRIDES);
    await this.requireMutableUser(actor, userId);
    return this.repository.createPermissionOverride(actor.userId, userId, input);
  }

  async deleteOverride(actor: AuthorizationActor, userId: string, overrideId: string) {
    authorize(actor, PERMISSIONS.USER_MANAGE_PERMISSION_OVERRIDES);
    await this.requireMutableUser(actor, userId);
    await this.repository.deletePermissionOverride(userId, overrideId);
  }

  permissionCatalog(actor: AuthorizationActor): readonly Permission[] {
    authorize(actor, PERMISSIONS.USER_MANAGE_PERMISSION_OVERRIDES);
    return Object.values(PERMISSIONS);
  }

  private async requireUser(userId: string) {
    const user = await this.repository.findAdminUser(userId);
    if (!user) throw new IdentityNotFoundError("Application user was not found");
    return user;
  }

  private async requireMutableUser(actor: AuthorizationActor, userId: string) {
    if (actor.userId === userId) {
      throw new InvalidAccountAdministrationError(
        "Use another Superadmin for changes to your own privileged account",
      );
    }
    const user = await this.requireUser(userId);
    if (user.access.roleCode === ROLES.SUPERADMIN) {
      throw new InvalidAccountAdministrationError(
        "Superadmin accounts are managed through the controlled provisioning process",
      );
    }
    return user;
  }
}
