import { describe, expect, test } from "bun:test";

import {
  ACCOUNT_STATUSES,
  ROLES,
  type AuthorizationActor,
  type RoleCode,
} from "../../authorization/authorization.types";
import type { IdentityAccessRepository } from "./identity.repository";
import { publicRegistrationSchema } from "./registration.schema";
import { RegistrationService } from "./registration.service";
import type {
  ApprovalDecision,
  ApprovalReviewResult,
  IdentityProvider,
  RegistrationCredentials,
} from "./identity.types";

class FakeIdentityProvider implements IdentityProvider {
  deletedUsers: string[] = [];

  async signUp(credentials: RegistrationCredentials) {
    return {
      user: { id: "new-user", email: credentials.email, name: credentials.name },
      cookies: ["session=test"],
    };
  }

  async deleteUser(userId: string) {
    this.deletedUsers.push(userId);
  }
}

class FakeAccessRepository implements IdentityAccessRepository {
  mentees: string[] = [];
  pending: Array<{ roleCode: RoleCode; userId: string }> = [];
  pendingError: Error | null = null;

  async initializeMentee(userId: string) {
    this.mentees.push(userId);
  }

  async initializePendingRegistration(userId: string, roleCode: RoleCode) {
    if (this.pendingError) {
      throw this.pendingError;
    }
    this.pending.push({ userId, roleCode });
  }

  async findActor(_userId: string): Promise<AuthorizationActor | null> {
    return null;
  }

  async reviewApproval(_input: {
    approvalId: string;
    decision: ApprovalDecision;
    reviewNote?: string;
    reviewerId: string;
  }): Promise<ApprovalReviewResult> {
    throw new Error("Not used by registration tests");
  }

  async bootstrapSuperadmin(_email: string) {
    return { email: _email, userId: "not-used" };
  }
}

function createService() {
  const identity = new FakeIdentityProvider();
  const repository = new FakeAccessRepository();
  return { identity, repository, service: new RegistrationService(identity, repository) };
}

const credentials = {
  name: "Research User",
  email: "user@example.com",
  password: "Safe-password1",
} as const;

describe("registration initialization", () => {
  test("Mentee registration becomes active", async () => {
    const { repository, service } = createService();
    const result = await service.register({ ...credentials, kind: "MENTEE" });

    expect(result.access).toEqual({
      roleCode: ROLES.MENTEE,
      accountStatus: ACCOUNT_STATUSES.ACTIVE,
    });
    expect(repository.mentees).toEqual(["new-user"]);
    expect(repository.pending).toEqual([]);
  });

  test("Mentor registration becomes pending", async () => {
    const { repository, service } = createService();
    const result = await service.register({ ...credentials, kind: "MENTOR" });

    expect(result.access).toEqual({
      roleCode: ROLES.MENTOR,
      accountStatus: ACCOUNT_STATUSES.PENDING,
    });
    expect(repository.pending).toEqual([{ userId: "new-user", roleCode: ROLES.MENTOR }]);
  });

  test("Staff registration becomes pending with an allowed staff role", async () => {
    const { repository, service } = createService();
    const result = await service.register({
      ...credentials,
      kind: "STAFF",
      requestedRoleCode: ROLES.COO,
    });

    expect(result.access).toEqual({ roleCode: ROLES.COO, accountStatus: ACCOUNT_STATUSES.PENDING });
    expect(repository.pending).toEqual([{ userId: "new-user", roleCode: ROLES.COO }]);
  });

  test("public registration rejects Superadmin", () => {
    const result = publicRegistrationSchema.safeParse({
      ...credentials,
      kind: "STAFF",
      requestedRoleCode: ROLES.SUPERADMIN,
    });

    expect(result.success).toBe(false);
  });

  test("removes a new identity when access initialization fails", async () => {
    const { identity, repository, service } = createService();
    repository.pendingError = new Error("database failure");

    expect(service.register({ ...credentials, kind: "MENTOR" })).rejects.toThrow(
      "database failure",
    );
    expect(identity.deletedUsers).toEqual(["new-user"]);
  });
});
