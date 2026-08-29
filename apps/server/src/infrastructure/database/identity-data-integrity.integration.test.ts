import { afterEach, describe, expect, test } from "bun:test";
import prisma from "@platform/db";

import {
  ACCESS_PROFILE_CODES,
  ACCOUNT_STATUSES,
  ROLES,
} from "../../authorization/authorization.types.js";
import { ApprovalService } from "../../modules/identity/approval.service.js";
import { InvalidApprovalTransitionError } from "../../modules/identity/identity.errors.js";
import { APPROVAL_DECISIONS, APPROVAL_STATUSES } from "../../modules/identity/identity.types.js";
import { PrismaIdentityRepository } from "./prisma-identity.repository.js";

const databaseTest = process.env.RUN_DATABASE_TESTS === "true" ? test : test.skip;
const createdUserIds: string[] = [];

async function createUser(label: string) {
  const id = crypto.randomUUID();
  createdUserIds.push(id);
  return prisma.user.create({
    data: {
      id,
      email: `${label}-${id}@example.invalid`,
      emailVerified: false,
      name: `Phase 2 ${label}`,
    },
  });
}

async function expectConstraintViolation(operation: () => Promise<unknown>) {
  let caught: unknown;
  try {
    await operation();
  } catch (error) {
    caught = error;
  }
  expect(caught).toBeInstanceOf(Error);
}

afterEach(async () => {
  if (createdUserIds.length > 0) {
    await prisma.user.deleteMany({ where: { id: { in: createdUserIds.splice(0) } } });
  }
});

describe("identity data integrity", () => {
  databaseTest(
    "bootstraps Superadmin idempotently and approves pending access",
    async () => {
      const reviewer = await createUser("reviewer");
      const target = await createUser("mentor");
      const repository = new PrismaIdentityRepository();

      const firstBootstrap = await repository.bootstrapSuperadmin(reviewer.email);
      const secondBootstrap = await repository.bootstrapSuperadmin(reviewer.email);
      expect(secondBootstrap).toEqual(firstBootstrap);

      await repository.initializePendingRegistration(target.id, ROLES.MENTOR);
      const approval = await prisma.accountApproval.findUniqueOrThrow({
        where: { userId: target.id },
      });
      const result = await new ApprovalService(repository).review({
        actorId: reviewer.id,
        approvalId: approval.id,
        decision: APPROVAL_DECISIONS.APPROVE,
      });

      expect(result).toMatchObject({
        accountStatus: ACCOUNT_STATUSES.ACTIVE,
        approvalStatus: APPROVAL_STATUSES.APPROVED,
        roleCode: ROLES.MENTOR,
        userId: target.id,
      });
      expect(
        await prisma.userAccess.findUniqueOrThrow({ where: { userId: target.id } }),
      ).toMatchObject({
        accountStatus: ACCOUNT_STATUSES.ACTIVE,
        accessProfileCode: ACCESS_PROFILE_CODES.MENTOR_DEFAULT,
        roleCode: ROLES.MENTOR,
      });
    },
    20_000,
  );

  databaseTest(
    "rejects pending access and prevents a second review",
    async () => {
      const reviewer = await createUser("reviewer");
      const target = await createUser("staff");
      const repository = new PrismaIdentityRepository();
      await repository.bootstrapSuperadmin(reviewer.email);
      await repository.initializePendingRegistration(target.id, ROLES.CMO);
      const approval = await prisma.accountApproval.findUniqueOrThrow({
        where: { userId: target.id },
      });
      const approvalService = new ApprovalService(repository);

      const result = await approvalService.review({
        actorId: reviewer.id,
        approvalId: approval.id,
        decision: APPROVAL_DECISIONS.REJECT,
        reviewNote: "Not approved",
      });
      expect(result).toMatchObject({
        accountStatus: ACCOUNT_STATUSES.PENDING,
        approvalStatus: APPROVAL_STATUSES.REJECTED,
        roleCode: ROLES.CMO,
      });
      expect(
        await prisma.userAccess.findUniqueOrThrow({ where: { userId: target.id } }),
      ).toMatchObject({
        accountStatus: ACCOUNT_STATUSES.PENDING,
        accessProfileCode: ACCESS_PROFILE_CODES.MARKETING_FULL,
        roleCode: ROLES.CMO,
      });
      await expect(
        repository.reviewApproval({
          approvalId: approval.id,
          decision: APPROVAL_DECISIONS.APPROVE,
          reviewerId: reviewer.id,
        }),
      ).rejects.toBeInstanceOf(InvalidApprovalTransitionError);
    },
    20_000,
  );

  databaseTest(
    "enforces profile, access, and approval relationships",
    async () => {
      const target = await createUser("target");

      await prisma.userProfile.create({ data: { userId: target.id } });
      await expectConstraintViolation(() =>
        prisma.userProfile.create({ data: { userId: target.id } }),
      );

      await prisma.userAccess.create({
        data: {
          userId: target.id,
          roleCode: ROLES.MENTEE,
          accessProfileCode: ACCESS_PROFILE_CODES.MENTEE_DEFAULT,
          accountStatus: ACCOUNT_STATUSES.ACTIVE,
        },
      });
      await expectConstraintViolation(() =>
        prisma.userAccess.create({
          data: {
            userId: target.id,
            roleCode: ROLES.MENTOR,
            accessProfileCode: ACCESS_PROFILE_CODES.MENTOR_DEFAULT,
            accountStatus: ACCOUNT_STATUSES.PENDING,
          },
        }),
      );

      await prisma.accountApproval.create({
        data: { userId: target.id, requestedRoleCode: ROLES.MENTOR },
      });
      await expectConstraintViolation(() =>
        prisma.accountApproval.create({
          data: { userId: target.id, requestedRoleCode: ROLES.MENTOR },
        }),
      );

      await expectConstraintViolation(() =>
        prisma.accountApproval.create({
          data: { userId: crypto.randomUUID(), requestedRoleCode: ROLES.MENTOR },
        }),
      );
    },
    20_000,
  );
});
