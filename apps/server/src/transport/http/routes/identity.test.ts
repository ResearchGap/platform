import { afterEach, describe, expect, test } from "bun:test";
import type { Server } from "node:http";
import type { AddressInfo } from "node:net";
import express from "express";

import {
  ACCESS_PROFILE_CODES,
  ACCOUNT_STATUSES,
  ROLES,
  type AuthorizationActor,
  type RoleCode,
} from "../../../authorization/authorization.types";
import type { IdentityAccessRepository } from "../../../modules/identity/identity.repository";
import type {
  ApprovalDecision,
  ApprovalReviewResult,
  PublicRegistration,
  RegistrationResult,
} from "../../../modules/identity/identity.types";
import { createIdentityRouter } from "./identity";

const servers: Server[] = [];

class HttpTestRepository implements IdentityAccessRepository {
  actor: AuthorizationActor | null = null;

  async bootstrapSuperadmin(email: string) {
    return { email, userId: "unused" };
  }

  async findActor(_userId: string) {
    return this.actor;
  }

  async initializeMentee(_userId: string) {}
  async initializePendingRegistration(_userId: string, _roleCode: RoleCode) {}

  async reviewApproval(_input: {
    approvalId: string;
    decision: ApprovalDecision;
    reviewNote?: string;
    reviewerId: string;
  }): Promise<ApprovalReviewResult> {
    throw new Error("Not used by HTTP authorization tests");
  }
}

async function startServer(input: {
  actor?: AuthorizationActor | null;
  sessionUserId?: string | null;
}) {
  const repository = new HttpTestRepository();
  repository.actor = input.actor ?? null;
  const router = createIdentityRouter({
    approvalService: {
      review: async () => {
        throw new Error("Not used by HTTP authorization tests");
      },
    },
    registrationService: {
      register: async (registration: PublicRegistration): Promise<RegistrationResult> => ({
        access: {
          accountStatus: ACCOUNT_STATUSES.ACTIVE,
          roleCode: ROLES.MENTEE,
        },
        cookies: [],
        user: {
          email: registration.email,
          id: "new-user",
          name: registration.name,
        },
      }),
    },
    repository,
    resolveSessionUser: async () =>
      input.sessionUserId === null ? null : { id: input.sessionUserId ?? "session-user" },
  });

  const app = express();
  app.use(express.json());
  app.use("/api", router);
  const server = await new Promise<Server>((resolve) => {
    const listeningServer = app.listen(0, "127.0.0.1", () => resolve(listeningServer));
  });
  servers.push(server);
  const address = server.address() as AddressInfo;
  return `http://127.0.0.1:${address.port}`;
}

afterEach(async () => {
  await Promise.all(
    servers.splice(0).map(
      (server) =>
        new Promise<void>((resolve, reject) => {
          server.close((error) => (error ? reject(error) : resolve()));
        }),
    ),
  );
});

describe("identity HTTP authorization", () => {
  test("public registration rejects Superadmin", async () => {
    const origin = await startServer({});
    const response = await fetch(`${origin}/api/registrations`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        email: "admin@example.com",
        kind: "STAFF",
        name: "Admin",
        password: "Safe-password1",
        requestedRoleCode: ROLES.SUPERADMIN,
      }),
    });

    expect(response.status).toBe(400);
  });

  test("protected routes return 401 without a Better Auth session", async () => {
    const origin = await startServer({ sessionUserId: null });
    const response = await fetch(`${origin}/api/account-approvals/approval-1/review`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ decision: "APPROVE" }),
    });

    expect(response.status).toBe(401);
    expect(await response.json()).toEqual({ error: "unauthenticated" });
  });

  test("protected routes return 403 when the access profile lacks permission", async () => {
    const origin = await startServer({
      actor: {
        userId: "session-user",
        roleCode: ROLES.MENTOR,
        accessProfileCode: ACCESS_PROFILE_CODES.MENTOR_DEFAULT,
        accountStatus: ACCOUNT_STATUSES.ACTIVE,
        overrides: [],
      },
    });
    const response = await fetch(`${origin}/api/account-approvals/approval-1/review`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ decision: "APPROVE" }),
    });

    expect(response.status).toBe(403);
    expect(await response.json()).toEqual({ error: "forbidden" });
  });

  test("pending accounts cannot use normal protected application routes", async () => {
    const origin = await startServer({
      actor: {
        userId: "session-user",
        roleCode: ROLES.SUPERADMIN,
        accessProfileCode: ACCESS_PROFILE_CODES.SUPERADMIN,
        accountStatus: ACCOUNT_STATUSES.PENDING,
        overrides: [],
      },
    });
    const response = await fetch(`${origin}/api/account-approvals/approval-1/review`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ decision: "APPROVE" }),
    });

    expect(response.status).toBe(403);
  });
});
