import { Router, type ErrorRequestHandler, type Response } from "express";
import { z } from "zod";

import { AuthorizationError } from "../../../authorization/authorize";
import { PERMISSIONS } from "../../../authorization/permissions";
import {
  ContentConflictError,
  ContentLifecycleError,
  ContentMediaNotFoundError,
  ContentNotFoundError,
} from "../../../modules/content/content.errors";
import type { ResearchContentService } from "../../../modules/content/content.service";
import {
  contentIdSchema,
  contentListSchema,
  contentSlugSchema,
  createResearchContentSchema,
  publicContentListSchema,
  updateResearchContentSchema,
} from "../../../modules/content/content.schema";
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

export function createResearchContentRouter(input: {
  contentService: ResearchContentService;
  identityRepository: IdentityAccessRepository;
  resolveSessionUser: ResolveSessionUser;
}): ReturnType<typeof Router> {
  const router = Router();
  const authenticate = requireAuthenticatedActor(
    input.resolveSessionUser,
    input.identityRepository,
  );

  router.get("/public/content", async (request, response) => {
    const query = publicContentListSchema.parse(request.query);
    response.status(200).json(await input.contentService.listPublished(query));
  });

  router.get("/public/content/:slug", async (request, response) => {
    const slug = contentSlugSchema.parse(pathParameter(request.params.slug));
    response.status(200).json(await input.contentService.getPublishedBySlug(slug));
  });

  router.get(
    "/content",
    authenticate,
    requirePermission(PERMISSIONS.CONTENT_READ),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const query = contentListSchema.parse(request.query);
      response.status(200).json(await input.contentService.list(response.locals.actor, query));
    },
  );

  router.post(
    "/content",
    authenticate,
    requirePermission(PERMISSIONS.CONTENT_CREATE),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const content = createResearchContentSchema.parse(request.body);
      response.status(201).json(await input.contentService.create(response.locals.actor, content));
    },
  );

  router.get(
    "/content/:contentId",
    authenticate,
    requirePermission(PERMISSIONS.CONTENT_READ),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const contentId = contentIdSchema.parse(pathParameter(request.params.contentId));
      response
        .status(200)
        .json(await input.contentService.getById(response.locals.actor, contentId));
    },
  );

  router.patch(
    "/content/:contentId",
    authenticate,
    requirePermission(PERMISSIONS.CONTENT_UPDATE),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const contentId = contentIdSchema.parse(pathParameter(request.params.contentId));
      const update = updateResearchContentSchema.parse(request.body);
      response
        .status(200)
        .json(await input.contentService.update(response.locals.actor, contentId, update));
    },
  );

  router.post(
    "/content/:contentId/publish",
    authenticate,
    requirePermission(PERMISSIONS.CONTENT_PUBLISH),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const contentId = contentIdSchema.parse(pathParameter(request.params.contentId));
      response
        .status(200)
        .json(await input.contentService.publish(response.locals.actor, contentId));
    },
  );

  router.post(
    "/content/:contentId/archive",
    authenticate,
    requirePermission(PERMISSIONS.CONTENT_PUBLISH),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const contentId = contentIdSchema.parse(pathParameter(request.params.contentId));
      response
        .status(200)
        .json(await input.contentService.archive(response.locals.actor, contentId));
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
    if (error instanceof ContentNotFoundError) {
      response.status(404).json({ error: "not_found", message: error.message });
      return;
    }
    if (error instanceof ContentMediaNotFoundError) {
      response.status(400).json({ error: "invalid_media_reference", message: error.message });
      return;
    }
    if (error instanceof ContentConflictError || error instanceof ContentLifecycleError) {
      response.status(409).json({ error: "content_conflict", message: error.message });
      return;
    }
    response.status(500).json({ error: "internal_error" });
  };
  router.use(errorHandler);

  return router;
}
