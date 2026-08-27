import { APIError } from "better-auth/api";
import { Router, type ErrorRequestHandler, type Response } from "express";
import { z } from "zod";

import { AuthorizationError } from "../../../authorization/authorize";
import { PERMISSIONS } from "../../../authorization/permissions";
import {
  IdentityNotFoundError,
  InvalidApprovalTransitionError,
} from "../../../modules/identity/identity.errors";
import type {
  CurrentAccountRepository,
  IdentityAccessRepository,
} from "../../../modules/identity/identity.repository";
import type { ApprovalService } from "../../../modules/identity/approval.service";
import type { RegistrationService } from "../../../modules/identity/registration.service";
import { updateUserProfileSchema } from "../../../modules/identity/profile.schema";
import { publicRegistrationSchema } from "../../../modules/identity/registration.schema";
import { APPROVAL_DECISIONS } from "../../../modules/identity/identity.types";
import {
  AuthenticationError,
  type AuthenticatedResponseLocals,
  type ResolveSessionUser,
  requireAuthenticatedActor,
  requirePermission,
} from "../authentication";

const reviewSchema = z.object({
  decision: z.enum([APPROVAL_DECISIONS.APPROVE, APPROVAL_DECISIONS.REJECT]),
  reviewNote: z.string().trim().max(2_000).optional(),
});

function appendCookies(response: Response, cookies: readonly string[]) {
  for (const cookie of cookies) {
    response.appendHeader("set-cookie", cookie);
  }
}

export function createIdentityRouter(input: {
  accountRepository?: CurrentAccountRepository;
  approvalService: Pick<ApprovalService, "review">;
  registrationService: Pick<RegistrationService, "register">;
  repository: IdentityAccessRepository;
  resolveSessionUser: ResolveSessionUser;
}): ReturnType<typeof Router> {
  const router = Router();
  const authenticate = requireAuthenticatedActor(input.resolveSessionUser, input.repository);

  router.post("/registrations", async (request, response) => {
    const registration = publicRegistrationSchema.parse(request.body);
    const result = await input.registrationService.register(registration);
    appendCookies(response, result.cookies);
    response.status(201).json({ user: result.user, access: result.access });
  });

  router.get(
    "/access/me",
    authenticate,
    (_request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      response.status(200).json(response.locals.actor);
    },
  );

  const accountRepository = input.accountRepository;
  if (accountRepository) {
    router.get(
      "/me/account",
      authenticate,
      async (_request, response: Response<unknown, AuthenticatedResponseLocals>) => {
        const account = await accountRepository.findCurrentAccount(response.locals.actor.userId);
        if (!account) {
          throw new IdentityNotFoundError("Application account was not found");
        }
        response.status(200).json(account);
      },
    );

    router.patch(
      "/me/profile",
      authenticate,
      async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
        const profile = updateUserProfileSchema.parse(request.body);
        response
          .status(200)
          .json(await accountRepository.updateProfile(response.locals.actor.userId, profile));
      },
    );
  }

  router.post(
    "/account-approvals/:approvalId/review",
    authenticate,
    requirePermission(PERMISSIONS.USER_APPROVE),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const review = reviewSchema.parse(request.body);
      const rawApprovalId = request.params.approvalId;
      const approvalId = Array.isArray(rawApprovalId) ? (rawApprovalId[0] ?? "") : rawApprovalId;
      const result = await input.approvalService.review({
        actorId: response.locals.actor.userId,
        approvalId: approvalId ?? "",
        ...review,
      });
      response.status(200).json(result);
    },
  );

  const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
    if (error instanceof z.ZodError) {
      response.status(400).json({ error: "invalid_request", issues: error.issues });
      return;
    }
    if (error instanceof AuthenticationError) {
      response.status(401).json({ error: "unauthenticated" });
      return;
    }
    if (error instanceof AuthorizationError) {
      response.status(403).json({ error: "forbidden" });
      return;
    }
    if (error instanceof IdentityNotFoundError) {
      response.status(404).json({ error: "not_found", message: error.message });
      return;
    }
    if (error instanceof InvalidApprovalTransitionError) {
      response.status(409).json({ error: "invalid_transition", message: error.message });
      return;
    }
    if (error instanceof APIError) {
      response.status(error.statusCode).json({ error: error.body?.code ?? "authentication_error" });
      return;
    }
    response.status(500).json({ error: "internal_error" });
  };
  router.use(errorHandler);

  return router;
}
