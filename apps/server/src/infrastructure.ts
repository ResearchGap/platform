import { createAuth } from "@platform/auth";
import prisma from "@platform/db";
import { fromNodeHeaders, toNodeHandler } from "better-auth/node";
import type { Router } from "express";

import { ApprovalService } from "./modules/identity/approval.service.js";
import { IdentityAdministrationService } from "./modules/identity/administration.service.js";
import { RegistrationService } from "./modules/identity/registration.service.js";
import { BetterAuthIdentityProvider } from "./infrastructure/auth/better-auth-identity.js";
import {
  BetterAuthPasswordResetProvider,
  PasswordResetOperationContext,
} from "./infrastructure/auth/better-auth-password-reset.js";
import { AesGcmResetLinkCipher } from "./infrastructure/crypto/aes-gcm-reset-link-cipher.js";
import { PrismaIdentityRepository } from "./infrastructure/database/prisma-identity.repository.js";
import { PrismaPasswordResetRepository } from "./infrastructure/database/prisma-password-reset.repository.js";
import { SmtpEmailSender } from "./infrastructure/email/smtp-email-sender.js";
import { PrismaMediaRepository } from "./infrastructure/database/prisma-media.repository.js";
import { PrismaBootcampRepository } from "./infrastructure/database/prisma-bootcamp.repository.js";
import { PrismaEnrollmentRepository } from "./infrastructure/database/prisma-enrollment.repository.js";
import { PrismaExecutiveSummaryRepository } from "./infrastructure/database/prisma-executive.repository.js";
import { PrismaResearchContentRepository } from "./infrastructure/database/prisma-research-content.repository.js";
import { PrismaWebinarRepository } from "./infrastructure/database/prisma-webinar.repository.js";
import { SupabaseStorageAdapter } from "./infrastructure/storage/supabase-storage.adapter.js";
import { ResearchContentService } from "./modules/content/content.service.js";
import { BootcampService } from "./modules/bootcamp/bootcamp.service.js";
import { EnrollmentService } from "./modules/enrollment/enrollment.service.js";
import { ExecutiveService } from "./modules/executive/executive.service.js";
import { WebinarService } from "./modules/webinar/webinar.service.js";
import { MediaService } from "./modules/media/media.service.js";
import { PasswordResetService } from "./modules/password-reset/password-reset.service.js";
import { createIdentityRouter } from "./transport/http/routes/identity.js";
import { createBootcampRouter } from "./transport/http/routes/bootcamp.js";
import { createEnrollmentRouter } from "./transport/http/routes/enrollment.js";
import { createExecutiveRouter } from "./transport/http/routes/executive.js";
import { createResearchContentRouter } from "./transport/http/routes/content.js";
import { createWebinarRouter } from "./transport/http/routes/webinar.js";
import { createMediaRouter } from "./transport/http/routes/media.js";
import { createPasswordResetRouter } from "./transport/http/routes/password-reset.js";
import { serverConfig } from "./config.js";

export const identityRepository = new PrismaIdentityRepository();
const passwordResetOperationContext = new PasswordResetOperationContext();

export const auth = createAuth({
  isPasswordResetOperationTrusted: passwordResetOperationContext.isTrustedOperation,
  sendResetPassword: passwordResetOperationContext.sendResetPassword,
  onPasswordReset: passwordResetOperationContext.onPasswordReset,
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
const administrationService = new IdentityAdministrationService(identityRepository);
const bootcampRepository = new PrismaBootcampRepository();
const bootcampService = new BootcampService(bootcampRepository);
const enrollmentRepository = new PrismaEnrollmentRepository();
const enrollmentService = new EnrollmentService(enrollmentRepository);
const executiveRepository = new PrismaExecutiveSummaryRepository();
const executiveService = new ExecutiveService(executiveRepository);
const contentRepository = new PrismaResearchContentRepository();
const contentService = new ResearchContentService(contentRepository);
const webinarRepository = new PrismaWebinarRepository();
const webinarService = new WebinarService(webinarRepository);
const mediaRepository = new PrismaMediaRepository();
const fileStorage = new SupabaseStorageAdapter(serverConfig.storage);
const mediaService = new MediaService(mediaRepository, fileStorage);
const passwordResetRepository = new PrismaPasswordResetRepository();
const passwordResetProvider = new BetterAuthPasswordResetProvider(
  auth,
  passwordResetOperationContext,
);
const passwordResetService = new PasswordResetService(
  passwordResetRepository,
  passwordResetProvider,
  new SmtpEmailSender(serverConfig.email),
  new AesGcmResetLinkCipher(serverConfig.passwordResetEncryptionKey),
  serverConfig.corsOrigin,
);
passwordResetOperationContext.bindIssuedLinkHandler(
  passwordResetService.handleIssuedLink.bind(passwordResetService),
);

const resolveSessionUser = async (headers: Parameters<typeof fromNodeHeaders>[0]) => {
  const session = await auth.api.getSession({ headers: fromNodeHeaders(headers) });
  return session ? { id: session.user.id } : null;
};

export const authHandler = toNodeHandler(auth);
export const identityRouter: Router = createIdentityRouter({
  accountRepository: identityRepository,
  administrationService,
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
export const enrollmentRouter: Router = createEnrollmentRouter({
  enrollmentService,
  identityRepository,
  resolveSessionUser,
});
export const executiveRouter: Router = createExecutiveRouter({
  executiveService,
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
export const mediaRouter: Router = createMediaRouter({
  identityRepository,
  mediaService,
  resolveSessionUser,
});
export const passwordResetRouter: Router = createPasswordResetRouter({
  passwordResetService,
  repository: identityRepository,
  resolveSessionUser,
});

export async function checkDatabase() {
  await prisma.$queryRaw`SELECT 1`;
}
