import { createAuth } from "@platform/auth";
import prisma from "@platform/db";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import type { Router } from "express";

import { ApprovalService } from "./modules/identity/approval.service";
import { RegistrationService } from "./modules/identity/registration.service";
import { BetterAuthIdentityProvider } from "./infrastructure/auth/better-auth-identity";
import { PrismaIdentityRepository } from "./infrastructure/database/prisma-identity.repository";
import { PrismaBootcampRepository } from "./infrastructure/database/prisma-bootcamp.repository";
import { PrismaResearchContentRepository } from "./infrastructure/database/prisma-research-content.repository";
import { PrismaWebinarRepository } from "./infrastructure/database/prisma-webinar.repository";
import { ResearchContentService } from "./modules/content/content.service";
import { BootcampService } from "./modules/bootcamp/bootcamp.service";
import { WebinarService } from "./modules/webinar/webinar.service";
import { createIdentityRouter } from "./transport/http/routes/identity";
import { createBootcampRouter } from "./transport/http/routes/bootcamp";
import { createResearchContentRouter } from "./transport/http/routes/content";
import { createWebinarRouter } from "./transport/http/routes/webinar";

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
const bootcampRepository = new PrismaBootcampRepository();
const bootcampService = new BootcampService(bootcampRepository);
const contentRepository = new PrismaResearchContentRepository();
const contentService = new ResearchContentService(contentRepository);
const webinarRepository = new PrismaWebinarRepository();
const webinarService = new WebinarService(webinarRepository);

const resolveSessionUser = async (headers: Parameters<typeof fromNodeHeaders>[0]) => {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(headers) });
  return session ? { id: session.user.id } : null;
};

export const authHandler = toNodeHandler(auth);
export const identityRouter: Router = createIdentityRouter({
  approvalService,
  registrationService,
  repository: identityRepository,
  resolveSessionUser,
});
export const bootcampRouter: Router = createBootcampRouter({
  bootcampService,
  identityRepository,
  resolveSessionUser,
});
export const researchContentRouter: Router = createResearchContentRouter({
  contentService,
  identityRepository,
  resolveSessionUser,
});
export const webinarRouter: Router = createWebinarRouter({
  identityRepository,
  resolveSessionUser,
  webinarService,
});

export async function checkDatabase() {
  await prisma.$queryRaw`SELECT 1`;
}
