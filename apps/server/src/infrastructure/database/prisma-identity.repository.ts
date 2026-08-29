import prisma from "@platform/db";

import { ROLE_DEFAULT_ACCESS } from "../../authorization/roles.js";
import {
  ACCESS_PROFILE_CODES,
  ACCOUNT_STATUSES,
  ROLES,
  type AccountStatus,
  type AuthorizationActor,
  type RoleCode,
} from "../../authorization/authorization.types.js";
import {
  IdentityNotFoundError,
  InvalidApprovalTransitionError,
  PermissionOverrideConflictError,
} from "../../modules/identity/identity.errors.js";
import type {
  IdentityAccessRepository,
  IdentityAdministrationRepository,
} from "../../modules/identity/identity.repository.js";
import {
  APPROVAL_DECISIONS,
  APPROVAL_STATUSES,
  type AdminApprovalSummary,
  type AdminDashboardSummary,
  type AdminPage,
  type AdminUserDetail,
  type AdminUserSummary,
  type ApprovalReviewResult,
  type ApprovalStatus,
  type CreatePermissionOverrideInput,
  type CurrentAccountDetail,
  type UpdateUserProfileInput,
  type UserProfileDetail,
} from "../../modules/identity/identity.types.js";

const adminProfileSelect = {
  affiliation: true,
  biography: true,
  expertise: true,
  institution: true,
  nickname: true,
  researchField: true,
  whatsapp: true,
} as const;

const adminApprovalSelect = {
  createdAt: true,
  id: true,
  requestedRoleCode: true,
  reviewedAt: true,
  reviewNote: true,
  reviewedBy: { select: { id: true, name: true } },
  status: true,
  user: {
    select: {
      email: true,
      id: true,
      name: true,
      profile: { select: adminProfileSelect },
    },
  },
} as const;

export class PrismaIdentityRepository
  implements IdentityAccessRepository, IdentityAdministrationRepository
{
  async initializeMentee(userId: string): Promise<void> {
    await prisma.$transaction(async (transaction) => {
      await transaction.userProfile.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });
      await transaction.userAccess.upsert({
        where: { userId },
        create: {
          userId,
          roleCode: ROLES.MENTEE,
          accessProfileCode: ROLE_DEFAULT_ACCESS.MENTEE,
          accountStatus: ACCOUNT_STATUSES.ACTIVE,
        },
        update: {},
      });
    });
  }

  async initializePendingRegistration(userId: string, roleCode: RoleCode): Promise<void> {
    await prisma.$transaction(async (transaction) => {
      await transaction.userProfile.upsert({
        where: { userId },
        create: { userId },
        update: {},
      });
      await transaction.userAccess.upsert({
        where: { userId },
        create: {
          userId,
          roleCode,
          accessProfileCode: ROLE_DEFAULT_ACCESS[roleCode],
          accountStatus: ACCOUNT_STATUSES.PENDING,
        },
        update: {
          roleCode,
          accessProfileCode: ROLE_DEFAULT_ACCESS[roleCode],
          accountStatus: ACCOUNT_STATUSES.PENDING,
        },
      });
      await transaction.accountApproval.upsert({
        where: { userId },
        create: { userId, requestedRoleCode: roleCode },
        update: {
          requestedRoleCode: roleCode,
          status: APPROVAL_STATUSES.PENDING,
          reviewedById: null,
          reviewedAt: null,
          reviewNote: null,
        },
      });
    });
  }

  async findActor(userId: string): Promise<AuthorizationActor | null> {
    const [access, overrides] = await Promise.all([
      prisma.userAccess.findUnique({ where: { userId } }),
      prisma.userPermissionOverride.findMany({ where: { userId } }),
    ]);

    if (!access) {
      return null;
    }

    return {
      userId: access.userId,
      roleCode: access.roleCode,
      accessProfileCode: access.accessProfileCode,
      accountStatus: access.accountStatus,
      overrides: overrides.map((override) => ({
        permissionKey: override.permissionKey,
        effect: override.effect,
        expiresAt: override.expiresAt,
      })),
    };
  }

  async findCurrentAccount(userId: string): Promise<CurrentAccountDetail | null> {
    const account = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        image: true,
        name: true,
        access: {
          select: {
            accessProfileCode: true,
            accountStatus: true,
            roleCode: true,
          },
        },
        approvalRequest: {
          select: {
            requestedRoleCode: true,
            reviewNote: true,
            status: true,
          },
        },
        profile: {
          select: {
            affiliation: true,
            biography: true,
            expertise: true,
            institution: true,
            nickname: true,
            researchField: true,
            updatedAt: true,
            whatsapp: true,
          },
        },
      },
    });

    if (!account?.access || !account.profile) {
      return null;
    }

    return {
      user: {
        id: account.id,
        email: account.email,
        image: account.image,
        name: account.name,
      },
      access: account.access,
      approval: account.approvalRequest,
      profile: account.profile,
    };
  }

  async updateProfile(userId: string, input: UpdateUserProfileInput): Promise<UserProfileDetail> {
    const profile = await prisma.userProfile.updateMany({
      where: { userId },
      data: input,
    });
    if (profile.count !== 1) {
      throw new IdentityNotFoundError("User profile was not found");
    }

    const updated = await prisma.userProfile.findUnique({ where: { userId } });
    if (!updated) {
      throw new IdentityNotFoundError("User profile was not found");
    }
    return updated;
  }

  async reviewApproval(input: {
    approvalId: string;
    decision: "APPROVE" | "REJECT";
    reviewNote?: string;
    reviewerId: string;
  }): Promise<ApprovalReviewResult> {
    return prisma.$transaction(async (transaction) => {
      const approval = await transaction.accountApproval.findUnique({
        where: { id: input.approvalId },
      });

      if (!approval) {
        throw new IdentityNotFoundError("Approval request was not found");
      }
      if (approval.status !== APPROVAL_STATUSES.PENDING) {
        throw new InvalidApprovalTransitionError();
      }

      const status =
        input.decision === APPROVAL_DECISIONS.APPROVE
          ? APPROVAL_STATUSES.APPROVED
          : APPROVAL_STATUSES.REJECTED;
      const reviewedAt = new Date();
      const transition = await transaction.accountApproval.updateMany({
        where: { id: input.approvalId, status: APPROVAL_STATUSES.PENDING },
        data: {
          status,
          reviewedById: input.reviewerId,
          reviewedAt,
          reviewNote: input.reviewNote ?? null,
        },
      });

      if (transition.count !== 1) {
        throw new InvalidApprovalTransitionError();
      }

      let accountStatus: AccountStatus = ACCOUNT_STATUSES.PENDING;
      if (input.decision === APPROVAL_DECISIONS.APPROVE) {
        accountStatus = ACCOUNT_STATUSES.ACTIVE;
        await transaction.userAccess.update({
          where: { userId: approval.userId },
          data: {
            roleCode: approval.requestedRoleCode,
            accessProfileCode: ROLE_DEFAULT_ACCESS[approval.requestedRoleCode],
            accountStatus,
          },
        });
      }

      return {
        approvalId: approval.id,
        approvalStatus: status,
        userId: approval.userId,
        roleCode: approval.requestedRoleCode,
        accountStatus,
      };
    });
  }

  async bootstrapSuperadmin(email: string): Promise<{ email: string; userId: string }> {
    return prisma.$transaction(async (transaction) => {
      const user = await transaction.user.findUnique({ where: { email: email.toLowerCase() } });
      if (!user) {
        throw new IdentityNotFoundError(
          "Create the Better Auth user first, then rerun the Superadmin bootstrap",
        );
      }

      await transaction.userProfile.upsert({
        where: { userId: user.id },
        create: { userId: user.id },
        update: {},
      });
      await transaction.userAccess.upsert({
        where: { userId: user.id },
        create: {
          userId: user.id,
          roleCode: ROLES.SUPERADMIN,
          accessProfileCode: ACCESS_PROFILE_CODES.SUPERADMIN,
          accountStatus: ACCOUNT_STATUSES.ACTIVE,
        },
        update: {
          roleCode: ROLES.SUPERADMIN,
          accessProfileCode: ACCESS_PROFILE_CODES.SUPERADMIN,
          accountStatus: ACCOUNT_STATUSES.ACTIVE,
        },
      });
      await transaction.accountApproval.updateMany({
        where: { userId: user.id, status: APPROVAL_STATUSES.PENDING },
        data: {
          status: APPROVAL_STATUSES.APPROVED,
          reviewedById: user.id,
          reviewedAt: new Date(),
          reviewNote: "Initial Superadmin bootstrap",
        },
      });

      return { email: user.email, userId: user.id };
    });
  }

  async getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
    const [
      totalUsers,
      accountStatuses,
      roleDistribution,
      pendingMentorApprovals,
      pendingStaffApprovals,
    ] = await Promise.all([
      prisma.userAccess.count(),
      prisma.userAccess.groupBy({ by: ["accountStatus"], _count: { _all: true } }),
      prisma.userAccess.groupBy({ by: ["roleCode"], _count: { _all: true } }),
      prisma.accountApproval.count({
        where: { status: APPROVAL_STATUSES.PENDING, requestedRoleCode: ROLES.MENTOR },
      }),
      prisma.accountApproval.count({
        where: {
          status: APPROVAL_STATUSES.PENDING,
          requestedRoleCode: { in: [ROLES.CEO, ROLES.COO, ROLES.CMO] },
        },
      }),
    ]);

    return {
      totalUsers,
      pendingMentorApprovals,
      pendingStaffApprovals,
      accountStatuses: {
        PENDING:
          accountStatuses.find((entry) => entry.accountStatus === "PENDING")?._count._all ?? 0,
        ACTIVE: accountStatuses.find((entry) => entry.accountStatus === "ACTIVE")?._count._all ?? 0,
        SUSPENDED:
          accountStatuses.find((entry) => entry.accountStatus === "SUSPENDED")?._count._all ?? 0,
        DISABLED:
          accountStatuses.find((entry) => entry.accountStatus === "DISABLED")?._count._all ?? 0,
      },
      roleDistribution: Object.fromEntries(
        roleDistribution.map((entry) => [entry.roleCode, entry._count._all]),
      ),
    };
  }

  async listAdminApprovals(input: {
    cursor?: string;
    limit: number;
    requestedRoleCode?: RoleCode;
    status?: ApprovalStatus;
  }): Promise<AdminPage<AdminApprovalSummary>> {
    const rows = await prisma.accountApproval.findMany({
      where: {
        requestedRoleCode: input.requestedRoleCode,
        status: input.status,
      },
      select: adminApprovalSelect,
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      cursor: input.cursor ? { id: input.cursor } : undefined,
      skip: input.cursor ? 1 : 0,
      take: input.limit + 1,
    });
    const hasMore = rows.length > input.limit;
    const pageRows = hasMore ? rows.slice(0, input.limit) : rows;
    const items = pageRows.map(({ reviewedBy, ...approval }) => ({
      ...approval,
      reviewer: reviewedBy,
    }));
    return { items, nextCursor: hasMore ? (pageRows.at(-1)?.id ?? null) : null };
  }

  async findAdminApproval(approvalId: string): Promise<AdminApprovalSummary | null> {
    const approval = await prisma.accountApproval.findUnique({
      where: { id: approvalId },
      select: adminApprovalSelect,
    });
    if (!approval) return null;
    const { reviewedBy, ...detail } = approval;
    return { ...detail, reviewer: reviewedBy };
  }

  async listAdminUsers(input: {
    accountStatus?: AccountStatus;
    approvalStatus?: ApprovalStatus;
    cursor?: string;
    limit: number;
    roleCode?: RoleCode;
  }): Promise<AdminPage<AdminUserSummary>> {
    const rows = await prisma.user.findMany({
      where: {
        access: {
          is: {
            accountStatus: input.accountStatus,
            roleCode: input.roleCode,
          },
        },
        approvalRequest: input.approvalStatus
          ? { is: { status: input.approvalStatus } }
          : undefined,
      },
      select: {
        id: true,
        email: true,
        image: true,
        name: true,
        createdAt: true,
        access: {
          select: { accessProfileCode: true, accountStatus: true, roleCode: true },
        },
        approvalRequest: {
          select: { id: true, requestedRoleCode: true, status: true },
        },
        profile: { select: adminProfileSelect },
        _count: { select: { permissionOverrides: true } },
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      cursor: input.cursor ? { id: input.cursor } : undefined,
      skip: input.cursor ? 1 : 0,
      take: input.limit + 1,
    });
    const hasMore = rows.length > input.limit;
    const pageRows = hasMore ? rows.slice(0, input.limit) : rows;
    const items = pageRows.flatMap((row) =>
      row.access
        ? [
            {
              access: row.access,
              approval: row.approvalRequest,
              createdAt: row.createdAt,
              email: row.email,
              id: row.id,
              image: row.image,
              name: row.name,
              overrideCount: row._count.permissionOverrides,
              profile: row.profile,
            },
          ]
        : [],
    );
    return { items, nextCursor: hasMore ? (pageRows.at(-1)?.id ?? null) : null };
  }

  async findAdminUser(userId: string): Promise<AdminUserDetail | null> {
    const row = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        image: true,
        name: true,
        createdAt: true,
        access: {
          select: { accessProfileCode: true, accountStatus: true, roleCode: true },
        },
        approvalRequest: {
          select: {
            createdAt: true,
            id: true,
            requestedRoleCode: true,
            reviewedAt: true,
            reviewNote: true,
            reviewedBy: { select: { id: true, name: true } },
            status: true,
          },
        },
        profile: { select: adminProfileSelect },
        permissionOverrides: {
          select: {
            createdAt: true,
            createdBy: { select: { id: true, name: true } },
            effect: true,
            expiresAt: true,
            id: true,
            permissionKey: true,
            reason: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });
    if (!row?.access) return null;

    return {
      access: row.access,
      approval: row.approvalRequest
        ? {
            ...row.approvalRequest,
            reviewer: row.approvalRequest.reviewedBy,
            user: {
              email: row.email,
              id: row.id,
              name: row.name,
              profile: row.profile,
            },
          }
        : null,
      createdAt: row.createdAt,
      email: row.email,
      id: row.id,
      image: row.image,
      name: row.name,
      overrideCount: row.permissionOverrides.length,
      overrides: row.permissionOverrides,
      profile: row.profile,
    };
  }

  async updateAdminAccountStatus(userId: string, status: AccountStatus): Promise<AdminUserDetail> {
    await prisma.userAccess.update({ where: { userId }, data: { accountStatus: status } });
    const user = await this.findAdminUser(userId);
    if (!user) throw new IdentityNotFoundError("Application user was not found");
    return user;
  }

  async updateAdminRole(userId: string, roleCode: RoleCode): Promise<AdminUserDetail> {
    await prisma.userAccess.update({
      where: { userId },
      data: { roleCode, accessProfileCode: ROLE_DEFAULT_ACCESS[roleCode] },
    });
    const user = await this.findAdminUser(userId);
    if (!user) throw new IdentityNotFoundError("Application user was not found");
    return user;
  }

  async createPermissionOverride(
    actorId: string,
    userId: string,
    input: CreatePermissionOverrideInput,
  ): Promise<AdminUserDetail> {
    try {
      await prisma.userPermissionOverride.create({
        data: {
          createdById: actorId,
          effect: input.effect,
          expiresAt: input.expiresAt,
          permissionKey: input.permissionKey,
          reason: input.reason,
          userId,
        },
      });
    } catch (error) {
      if (isUniqueConstraintError(error)) throw new PermissionOverrideConflictError();
      throw error;
    }
    const user = await this.findAdminUser(userId);
    if (!user) throw new IdentityNotFoundError("Application user was not found");
    return user;
  }

  async deletePermissionOverride(userId: string, overrideId: string): Promise<void> {
    const result = await prisma.userPermissionOverride.deleteMany({
      where: { id: overrideId, userId },
    });
    if (result.count !== 1) throw new IdentityNotFoundError("Permission override was not found");
  }
}

function isUniqueConstraintError(error: unknown): error is { code: "P2002" } {
  return typeof error === "object" && error !== null && "code" in error && error.code === "P2002";
}
