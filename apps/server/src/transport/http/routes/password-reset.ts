import { Router, type ErrorRequestHandler, type Response } from "express";
import { z } from "zod";

import { AuthorizationError } from "../../../authorization/authorize.js";
import {
  InvalidPasswordResetError,
  PasswordResetConflictError,
  PasswordResetNotFoundError,
} from "../../../modules/password-reset/password-reset.errors.js";
import {
  completePasswordResetSchema,
  passwordResetRequestSchema,
} from "../../../modules/password-reset/password-reset.schema.js";
import type { PasswordResetService } from "../../../modules/password-reset/password-reset.service.js";
import type { IdentityAccessRepository } from "../../../modules/identity/identity.repository.js";
import {
  AuthenticationError,
  type AuthenticatedResponseLocals,
  type ResolveSessionUser,
  requireAuthenticatedActor,
} from "../authentication.js";

export function createPasswordResetRouter(input: {
  passwordResetService: PasswordResetService;
  repository: IdentityAccessRepository;
  resolveSessionUser: ResolveSessionUser;
}): ReturnType<typeof Router> {
  const router = Router();
  const authenticate = requireAuthenticatedActor(input.resolveSessionUser, input.repository);

  router.post("/password-resets", async (request, response) => {
    const body = passwordResetRequestSchema.parse(request.body);
    response.status(200).json(
      await input.passwordResetService.request({
        email: body.email,
        ipAddress: clientIp(request.headers["x-forwarded-for"], request.ip),
        userAgent: request.get("user-agent")?.slice(0, 500) ?? null,
      }),
    );
  });

  router.post("/password-resets/complete", async (request, response) => {
    const body = completePasswordResetSchema.parse(request.body);
    await input.passwordResetService.complete(body);
    response.status(200).json({ status: "completed" });
  });

  router.get(
    "/admin/users/:userId/password-reset-requests",
    authenticate,
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      response.status(200).json({
        items: await input.passwordResetService.listForUser({
          actor: response.locals.actor,
          userId: routeParameter(request.params.userId),
        }),
      });
    },
  );

  router.post(
    "/admin/users/:userId/password-reset-requests/manual",
    authenticate,
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      response.status(201).json(
        await input.passwordResetService.createManual({
          actor: response.locals.actor,
          userId: routeParameter(request.params.userId),
        }),
      );
    },
  );

  router.post(
    "/admin/password-reset-requests/:requestId/reveal-link",
    authenticate,
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      response.setHeader("Cache-Control", "no-store");
      response.status(200).json(
        await input.passwordResetService.reveal({
          actor: response.locals.actor,
          requestId: routeParameter(request.params.requestId),
        }),
      );
    },
  );

  const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
    response.setHeader("Cache-Control", "no-store");
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
    if (error instanceof PasswordResetNotFoundError) {
      response.status(404).json({ error: "not_found" });
      return;
    }
    if (error instanceof PasswordResetConflictError) {
      response.status(409).json({ error: "operation_conflict", message: error.message });
      return;
    }
    if (error instanceof InvalidPasswordResetError) {
      response.status(400).json({ error: "invalid_or_expired_reset", message: error.message });
      return;
    }
    response.status(500).json({ error: "internal_error" });
  };
  router.use(errorHandler);

  return router;
}

function routeParameter(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

function clientIp(
  forwarded: string | string[] | undefined,
  fallback: string | undefined,
): string | null {
  const raw = Array.isArray(forwarded) ? forwarded[0] : forwarded;
  const first = raw?.split(",")[0]?.trim();
  return (first || fallback || null)?.slice(0, 128) ?? null;
}
