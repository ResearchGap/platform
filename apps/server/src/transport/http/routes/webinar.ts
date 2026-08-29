import { Router, type ErrorRequestHandler, type Response } from "express";
import { z } from "zod";

import { AuthorizationError } from "../../../authorization/authorize.js";
import { PERMISSIONS } from "../../../authorization/permissions.js";
import {
  WebinarConflictError,
  WebinarLifecycleError,
  WebinarMediaNotFoundError,
  WebinarNotFoundError,
} from "../../../modules/webinar/webinar.errors.js";
import {
  createWebinarSchema,
  publicWebinarListSchema,
  updateWebinarSchema,
  updateWebinarCoverSchema,
  webinarIdSchema,
  webinarListSchema,
  webinarSlugSchema,
} from "../../../modules/webinar/webinar.schema.js";
import type { WebinarService } from "../../../modules/webinar/webinar.service.js";
import type { IdentityAccessRepository } from "../../../modules/identity/identity.repository.js";
import {
  AuthenticationError,
  type AuthenticatedResponseLocals,
  type ResolveSessionUser,
  requireAuthenticatedActor,
  requirePermission,
} from "../authentication.js";

function pathParameter(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export function createWebinarRouter(input: {
  identityRepository: IdentityAccessRepository;
  resolveSessionUser: ResolveSessionUser;
  webinarService: WebinarService;
}): ReturnType<typeof Router> {
  const router = Router();
  const authenticate = requireAuthenticatedActor(
    input.resolveSessionUser,
    input.identityRepository,
  );

  router.get("/public/webinars", async (request, response) => {
    const query = publicWebinarListSchema.parse(request.query);
    response.status(200).json(await input.webinarService.listPublic(query));
  });

  router.get("/public/webinars/:slug", async (request, response) => {
    const slug = webinarSlugSchema.parse(pathParameter(request.params.slug));
    response.status(200).json(await input.webinarService.getPublicBySlug(slug));
  });

  router.get(
    "/visuals/webinars",
    authenticate,
    requirePermission(PERMISSIONS.WEBINAR_MANAGE_VISUAL),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const query = webinarListSchema.parse(request.query);
      response
        .status(200)
        .json(await input.webinarService.listVisuals(response.locals.actor, query));
    },
  );

  router.get(
    "/visuals/webinars/:webinarId",
    authenticate,
    requirePermission(PERMISSIONS.WEBINAR_MANAGE_VISUAL),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const webinarId = webinarIdSchema.parse(pathParameter(request.params.webinarId));
      response
        .status(200)
        .json(await input.webinarService.getVisual(response.locals.actor, webinarId));
    },
  );

  router.get(
    "/webinars",
    authenticate,
    requirePermission(PERMISSIONS.WEBINAR_READ),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const query = webinarListSchema.parse(request.query);
      response.status(200).json(await input.webinarService.list(response.locals.actor, query));
    },
  );

  router.post(
    "/webinars",
    authenticate,
    requirePermission(PERMISSIONS.WEBINAR_CREATE),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const webinar = createWebinarSchema.parse(request.body);
      response.status(201).json(await input.webinarService.create(response.locals.actor, webinar));
    },
  );

  router.get(
    "/webinars/:webinarId",
    authenticate,
    requirePermission(PERMISSIONS.WEBINAR_READ),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const webinarId = webinarIdSchema.parse(pathParameter(request.params.webinarId));
      response
        .status(200)
        .json(await input.webinarService.getById(response.locals.actor, webinarId));
    },
  );

  router.patch(
    "/webinars/:webinarId",
    authenticate,
    requirePermission(PERMISSIONS.WEBINAR_UPDATE),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const webinarId = webinarIdSchema.parse(pathParameter(request.params.webinarId));
      const update = updateWebinarSchema.parse(request.body);
      response
        .status(200)
        .json(await input.webinarService.update(response.locals.actor, webinarId, update));
    },
  );

  router.patch(
    "/webinars/:webinarId/cover",
    authenticate,
    requirePermission(PERMISSIONS.WEBINAR_MANAGE_VISUAL),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const webinarId = webinarIdSchema.parse(pathParameter(request.params.webinarId));
      const update = updateWebinarCoverSchema.parse(request.body);
      response
        .status(200)
        .json(
          await input.webinarService.updateCover(
            response.locals.actor,
            webinarId,
            update.coverAssetId,
          ),
        );
    },
  );

  router.post(
    "/webinars/:webinarId/publish",
    authenticate,
    requirePermission(PERMISSIONS.WEBINAR_PUBLISH),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const webinarId = webinarIdSchema.parse(pathParameter(request.params.webinarId));
      response
        .status(200)
        .json(await input.webinarService.publish(response.locals.actor, webinarId));
    },
  );

  router.post(
    "/webinars/:webinarId/complete",
    authenticate,
    requirePermission(PERMISSIONS.WEBINAR_PUBLISH),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const webinarId = webinarIdSchema.parse(pathParameter(request.params.webinarId));
      response
        .status(200)
        .json(await input.webinarService.complete(response.locals.actor, webinarId));
    },
  );

  router.post(
    "/webinars/:webinarId/archive",
    authenticate,
    requirePermission(PERMISSIONS.WEBINAR_PUBLISH),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const webinarId = webinarIdSchema.parse(pathParameter(request.params.webinarId));
      response
        .status(200)
        .json(await input.webinarService.archive(response.locals.actor, webinarId));
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
    if (error instanceof WebinarNotFoundError) {
      response.status(404).json({ error: "not_found", message: error.message });
      return;
    }
    if (error instanceof WebinarMediaNotFoundError) {
      response.status(400).json({ error: "invalid_media_reference", message: error.message });
      return;
    }
    if (error instanceof WebinarConflictError || error instanceof WebinarLifecycleError) {
      response.status(409).json({ error: "webinar_conflict", message: error.message });
      return;
    }
    response.status(500).json({ error: "internal_error" });
  };
  router.use(errorHandler);

  return router;
}
