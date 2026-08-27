import { Router, type ErrorRequestHandler, type Response } from "express";
import { z } from "zod";

import { AuthorizationError } from "../../../authorization/authorize";
import { PERMISSIONS } from "../../../authorization/permissions";
import {
  BootcampConflictError,
  BootcampDateRangeError,
  BootcampLifecycleError,
  BootcampMediaNotFoundError,
  BootcampNotFoundError,
  BootcampSessionNotFoundError,
  BootcampSessionOrderError,
} from "../../../modules/bootcamp/bootcamp.errors";
import {
  bootcampIdSchema,
  bootcampListSchema,
  bootcampSessionIdSchema,
  bootcampSlugSchema,
  createBootcampSchema,
  createBootcampSessionSchema,
  publicBootcampListSchema,
  reorderBootcampSessionsSchema,
  updateBootcampSchema,
  updateBootcampSessionSchema,
} from "../../../modules/bootcamp/bootcamp.schema";
import type { BootcampService } from "../../../modules/bootcamp/bootcamp.service";
import type { IdentityAccessRepository } from "../../../modules/identity/identity.repository";
import {
  AuthenticationError,
  type AuthenticatedResponseLocals,
  type ResolveSessionUser,
  requireAuthenticatedActor,
  requirePermission,
} from "../authentication";

function pathParameter(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export function createBootcampRouter(input: {
  bootcampService: BootcampService;
  identityRepository: IdentityAccessRepository;
  resolveSessionUser: ResolveSessionUser;
}): ReturnType<typeof Router> {
  const router = Router();
  const authenticate = requireAuthenticatedActor(
    input.resolveSessionUser,
    input.identityRepository,
  );

  router.get("/public/bootcamps", async (request, response) => {
    const query = publicBootcampListSchema.parse(request.query);
    response.status(200).json(await input.bootcampService.listPublic(query));
  });

  router.get("/public/bootcamps/:slug/sessions", async (request, response) => {
    const slug = bootcampSlugSchema.parse(pathParameter(request.params.slug));
    response.status(200).json(await input.bootcampService.listPublicSessions(slug));
  });

  router.get("/public/bootcamps/:slug", async (request, response) => {
    const slug = bootcampSlugSchema.parse(pathParameter(request.params.slug));
    response.status(200).json(await input.bootcampService.getPublicBySlug(slug));
  });

  router.get(
    "/bootcamps",
    authenticate,
    requirePermission(PERMISSIONS.BOOTCAMP_READ),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const query = bootcampListSchema.parse(request.query);
      response.status(200).json(await input.bootcampService.list(response.locals.actor, query));
    },
  );

  router.post(
    "/bootcamps",
    authenticate,
    requirePermission(PERMISSIONS.BOOTCAMP_CREATE),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const bootcamp = createBootcampSchema.parse(request.body);
      response
        .status(201)
        .json(await input.bootcampService.create(response.locals.actor, bootcamp));
    },
  );

  router.get(
    "/bootcamps/:bootcampId",
    authenticate,
    requirePermission(PERMISSIONS.BOOTCAMP_READ),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const bootcampId = bootcampIdSchema.parse(pathParameter(request.params.bootcampId));
      response
        .status(200)
        .json(await input.bootcampService.getById(response.locals.actor, bootcampId));
    },
  );

  router.patch(
    "/bootcamps/:bootcampId",
    authenticate,
    requirePermission(PERMISSIONS.BOOTCAMP_UPDATE),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const bootcampId = bootcampIdSchema.parse(pathParameter(request.params.bootcampId));
      const update = updateBootcampSchema.parse(request.body);
      response
        .status(200)
        .json(await input.bootcampService.update(response.locals.actor, bootcampId, update));
    },
  );

  router.post(
    "/bootcamps/:bootcampId/submit",
    authenticate,
    requirePermission(PERMISSIONS.BOOTCAMP_UPDATE),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const bootcampId = bootcampIdSchema.parse(pathParameter(request.params.bootcampId));
      response
        .status(200)
        .json(await input.bootcampService.submit(response.locals.actor, bootcampId));
    },
  );

  router.post(
    "/bootcamps/:bootcampId/publish",
    authenticate,
    requirePermission(PERMISSIONS.BOOTCAMP_PUBLISH),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const bootcampId = bootcampIdSchema.parse(pathParameter(request.params.bootcampId));
      response
        .status(200)
        .json(await input.bootcampService.publish(response.locals.actor, bootcampId));
    },
  );

  router.post(
    "/bootcamps/:bootcampId/complete",
    authenticate,
    requirePermission(PERMISSIONS.BOOTCAMP_PUBLISH),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const bootcampId = bootcampIdSchema.parse(pathParameter(request.params.bootcampId));
      response
        .status(200)
        .json(await input.bootcampService.complete(response.locals.actor, bootcampId));
    },
  );

  router.post(
    "/bootcamps/:bootcampId/archive",
    authenticate,
    requirePermission(PERMISSIONS.BOOTCAMP_PUBLISH),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const bootcampId = bootcampIdSchema.parse(pathParameter(request.params.bootcampId));
      response
        .status(200)
        .json(await input.bootcampService.archive(response.locals.actor, bootcampId));
    },
  );

  router.get(
    "/bootcamps/:bootcampId/sessions",
    authenticate,
    requirePermission(PERMISSIONS.BOOTCAMP_MANAGE_SESSIONS),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const bootcampId = bootcampIdSchema.parse(pathParameter(request.params.bootcampId));
      response
        .status(200)
        .json(await input.bootcampService.listSessions(response.locals.actor, bootcampId));
    },
  );

  router.post(
    "/bootcamps/:bootcampId/sessions",
    authenticate,
    requirePermission(PERMISSIONS.BOOTCAMP_MANAGE_SESSIONS),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const bootcampId = bootcampIdSchema.parse(pathParameter(request.params.bootcampId));
      const session = createBootcampSessionSchema.parse(request.body);
      response
        .status(201)
        .json(
          await input.bootcampService.createSession(response.locals.actor, bootcampId, session),
        );
    },
  );

  router.post(
    "/bootcamps/:bootcampId/sessions/reorder",
    authenticate,
    requirePermission(PERMISSIONS.BOOTCAMP_MANAGE_SESSIONS),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const bootcampId = bootcampIdSchema.parse(pathParameter(request.params.bootcampId));
      const order = reorderBootcampSessionsSchema.parse(request.body);
      response
        .status(200)
        .json(
          await input.bootcampService.reorderSessions(
            response.locals.actor,
            bootcampId,
            order.sessionIds,
          ),
        );
    },
  );

  router.get(
    "/bootcamps/:bootcampId/sessions/:sessionId",
    authenticate,
    requirePermission(PERMISSIONS.BOOTCAMP_MANAGE_SESSIONS),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const bootcampId = bootcampIdSchema.parse(pathParameter(request.params.bootcampId));
      const sessionId = bootcampSessionIdSchema.parse(pathParameter(request.params.sessionId));
      response
        .status(200)
        .json(await input.bootcampService.getSession(response.locals.actor, bootcampId, sessionId));
    },
  );

  router.patch(
    "/bootcamps/:bootcampId/sessions/:sessionId",
    authenticate,
    requirePermission(PERMISSIONS.BOOTCAMP_MANAGE_SESSIONS),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const bootcampId = bootcampIdSchema.parse(pathParameter(request.params.bootcampId));
      const sessionId = bootcampSessionIdSchema.parse(pathParameter(request.params.sessionId));
      const update = updateBootcampSessionSchema.parse(request.body);
      response
        .status(200)
        .json(
          await input.bootcampService.updateSession(
            response.locals.actor,
            bootcampId,
            sessionId,
            update,
          ),
        );
    },
  );

  router.delete(
    "/bootcamps/:bootcampId/sessions/:sessionId",
    authenticate,
    requirePermission(PERMISSIONS.BOOTCAMP_MANAGE_SESSIONS),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const bootcampId = bootcampIdSchema.parse(pathParameter(request.params.bootcampId));
      const sessionId = bootcampSessionIdSchema.parse(pathParameter(request.params.sessionId));
      await input.bootcampService.deleteSession(response.locals.actor, bootcampId, sessionId);
      response.status(204).send();
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
    if (error instanceof BootcampNotFoundError || error instanceof BootcampSessionNotFoundError) {
      response.status(404).json({ error: "not_found", message: error.message });
      return;
    }
    if (error instanceof BootcampMediaNotFoundError || error instanceof BootcampDateRangeError) {
      response.status(400).json({ error: "invalid_bootcamp", message: error.message });
      return;
    }
    if (
      error instanceof BootcampConflictError ||
      error instanceof BootcampLifecycleError ||
      error instanceof BootcampSessionOrderError
    ) {
      response.status(409).json({ error: "bootcamp_conflict", message: error.message });
      return;
    }
    response.status(500).json({ error: "internal_error" });
  };
  router.use(errorHandler);

  return router;
}
