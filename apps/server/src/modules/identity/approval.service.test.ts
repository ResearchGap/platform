import { describe, expect, test } from "bun:test";

import { AuthorizationError } from "../../authorization/authorize";
import {
  ACCESS_PROFILE_CODES,
  ACCOUNT_STATUSES,
  ROLES,
  type AuthorizationActor,
  type RoleCode,
} from "../../authorization/authorization.types";
import type { IdentityAccessRepository } from "./identity.repository";
import { InvalidApprovalTransitionError } from "./identity.errors";
import { ApprovalService } from "./approval.service";
import {
  APPROVAL_DECISIONS,
  APPROVAL_STATUSES,
  type ApprovalDecision,
  type ApprovalReviewResult,
} from "./identity.types";

class FakeApprovalRepository implements IdentityAccessRepository {
  actor: AuthorizationActor | null = null;
  status: "PENDING" | "APPROVED" | "REJECTED" = APPROVAL_STATUSES.PENDING;
  targetRole: RoleCode = ROLES.MENTOR;

  async findActor(_userId: string) {
    return this.actor;
  }

  async reviewApproval(input: {
    approvalId: string;
    decision: ApprovalDecision;
    reviewNote?: string;
    reviewerId: string;
  }): Promise<ApprovalReviewResult> {
    if (this.status !== APPROVAL_STATUSES.PENDING) {
      throw new InvalidApprovalTransitionError();
    }
    this.status =
      input.decision === APPROVAL_DECISIONS.APPROVE
        ? APPROVAL_STATUSES.APPROVED
        : APPROVAL_STATUSES.REJECTED;
    return {
      approvalId: input.approvalId,
      approvalStatus: this.status,
      userId: "target-user",
      roleCode: this.targetRole,
      accountStatus:
        this.status === APPROVAL_STATUSES.APPROVED
          ? ACCOUNT_STATUSES.ACTIVE
          : ACCOUNT_STATUSES.PENDING,
    };
  }

  async initializeMentee(_userId: string) {}
  async initializePendingRegistration(_userId: string, _roleCode: RoleCode) {}
  async bootstrapSuperadmin(_email: string) {
    return { email: _email, userId: "not-used" };
  }
}

function superadminActor(): AuthorizationActor {
  return {
    userId: "reviewer",
    roleCode: ROLES.SUPERADMIN,
    accessProfileCode: ACCESS_PROFILE_CODES.SUPERADMIN,
    accountStatus: ACCOUNT_STATUSES.ACTIVE,
    overrides: [],
  };
}

describe("account approval", () => {
  test("authorized actor can approve and activate access", async () => {
    const repository = new FakeApprovalRepository();
    repository.actor = superadminActor();

    const result = await new ApprovalService(repository).review({
      actorId: "reviewer",
      approvalId: "approval-1",
      decision: APPROVAL_DECISIONS.APPROVE,
    });

    expect(result.approvalStatus).toBe(APPROVAL_STATUSES.APPROVED);
    expect(result.accountStatus).toBe(ACCOUNT_STATUSES.ACTIVE);
    expect(result.roleCode).toBe(ROLES.MENTOR);
  });

  test("unauthorized actor cannot approve", async () => {
    const repository = new FakeApprovalRepository();
    repository.actor = {
      ...superadminActor(),
      roleCode: ROLES.COO,
      accessProfileCode: ACCESS_PROFILE_CODES.OPERATIONS_FULL,
    };

    expect(
      new ApprovalService(repository).review({
        actorId: "reviewer",
        approvalId: "approval-1",
        decision: APPROVAL_DECISIONS.APPROVE,
      }),
    ).rejects.toBeInstanceOf(AuthorizationError);
    expect(repository.status).toBe(APPROVAL_STATUSES.PENDING);
  });

  test("rejection leaves target access pending", async () => {
    const repository = new FakeApprovalRepository();
    repository.actor = superadminActor();

    const result = await new ApprovalService(repository).review({
      actorId: "reviewer",
      approvalId: "approval-1",
      decision: APPROVAL_DECISIONS.REJECT,
      reviewNote: "Not ready",
    });

    expect(result.approvalStatus).toBe(APPROVAL_STATUSES.REJECTED);
    expect(result.accountStatus).toBe(ACCOUNT_STATUSES.PENDING);
  });

  test("invalid state transitions are rejected", async () => {
    const repository = new FakeApprovalRepository();
    repository.actor = superadminActor();
    repository.status = APPROVAL_STATUSES.APPROVED;

    expect(
      new ApprovalService(repository).review({
        actorId: "reviewer",
        approvalId: "approval-1",
        decision: APPROVAL_DECISIONS.REJECT,
      }),
    ).rejects.toBeInstanceOf(InvalidApprovalTransitionError);
  });
});
