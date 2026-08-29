import { Router, type ErrorRequestHandler, type Response } from "express";

import { AuthorizationError } from "../../../authorization/authorize.js";
import { PERMISSIONS } from "../../../authorization/permissions.js";
import type { ExecutiveService } from "../../../modules/executive/executive.service.js";
import type { IdentityAccessRepository } from "../../../modules/identity/identity.repository.js";
import {
  AuthenticationError,
  type AuthenticatedResponseLocals,
  type ResolveSessionUser,
  requireAuthenticatedActor,
  requirePermission,
} from "../authentication.js";

export function createExecutiveRouter(input: {
  executiveService: ExecutiveService;
  identityRepository: IdentityAccessRepository;
  resolveSessionUser: ResolveSessionUser;
}): ReturnType<typeof Router> {
  const router = Router();
  const authenticate = requireAuthenticatedActor(
    input.resolveSessionUser,
    input.identityRepository,
  );

  router.get(
    "/executive/summary",
    authenticate,
    requirePermission(PERMISSIONS.ANALYTICS_READ_EXECUTIVE),
    async (_request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      response.status(200).json(await input.executiveService.getSummary(response.locals.actor));
    },
  );

  const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
    if (error instanceof AuthenticationError) {
      response.status(401).json({ error: "unauthenticated" });
      return;
    }
    if (error instanceof AuthorizationError) {
      response.status(403).json({ error: "forbidden" });
      return;
    }
    response.status(500).json({ error: "internal_error" });
  };
  router.use(errorHandler);

  return router;
}
