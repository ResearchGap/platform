import { createAuth } from "@platform/auth";
import prisma from "@platform/db";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import type { Router } from "express";

import { ApprovalService } from "./modules/identity/approval.service";
import { RegistrationService } from "./modules/identity/registration.service";
import { BetterAuthIdentityProvider } from "./infrastructure/auth/better-auth-identity";
import { PrismaIdentityRepository } from "./infrastructure/database/prisma-identity.repository";
import { createIdentityRouter } from "./transport/http/routes/identity";

export const identityRepository = new PrismaIdentityRepository();

export const auth = createAuth({
  onUserCreated: async (user) => {
    try {
      await identityRepository.initializeMentee(user.id);
    } catch (error) {
      await prisma.user.deleteMany({ where: { id: user.id } });
      throw error;
    }
  },
});

const identityProvider = new BetterAuthIdentityProvider(auth);
const registrationService = new RegistrationService(identityProvider, identityRepository);
const approvalService = new ApprovalService(identityRepository);

export const authHandler = toNodeHandler(auth);
export const identityRouter: Router = createIdentityRouter({
  approvalService,
  registrationService,
  repository: identityRepository,
  resolveSessionUser: async (headers) => {
    const session = await auth.api.getSession({ headers: fromNodeHeaders(headers) });
    return session ? { id: session.user.id } : null;
  },
});

export async function checkDatabase() {
  await prisma.$queryRaw`SELECT 1`;
}
