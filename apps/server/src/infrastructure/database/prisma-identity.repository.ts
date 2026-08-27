import prisma from "@platform/db";

import { ROLE_DEFAULT_ACCESS } from "../../authorization/roles";
import {
  ACCESS_PROFILE_CODES,
  ACCOUNT_STATUSES,
  ROLES,
  type AccountStatus,
  type AuthorizationActor,
  type RoleCode,
} from "../../authorization/authorization.types";
import {
  IdentityNotFoundError,
  InvalidApprovalTransitionError,
} from "../../modules/identity/identity.errors";
import type { IdentityAccessRepository } from "../../modules/identity/identity.repository";
import {
  APPROVAL_DECISIONS,
  APPROVAL_STATUSES,
  type ApprovalReviewResult,
  type CurrentAccountDetail,
  type UpdateUserProfileInput,
  type UserProfileDetail,
} from "../../modules/identity/identity.types";

export class PrismaIdentityRepository implements IdentityAccessRepository {
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
}
