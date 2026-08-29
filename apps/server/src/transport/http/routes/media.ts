import { Router, type ErrorRequestHandler, type Response } from "express";
import multer from "multer";
import { z } from "zod";

import { AuthorizationError } from "../../../authorization/authorize.js";
import { PERMISSIONS } from "../../../authorization/permissions.js";
import {
  MediaConflictError,
  MediaNotFoundError,
  MediaValidationError,
} from "../../../modules/media/media.errors.js";
import { MAX_MEDIA_BYTES } from "../../../modules/media/media.service.js";
import type { MediaService } from "../../../modules/media/media.service.js";
import { FileStorageError } from "../../../modules/media/file-storage.js";
import { mediaIdSchema } from "../../../modules/media/media.schema.js";
import type { IdentityAccessRepository } from "../../../modules/identity/identity.repository.js";
import {
  AuthenticationError,
  type AuthenticatedResponseLocals,
  type ResolveSessionUser,
  requireAuthenticatedActor,
  requirePermission,
} from "../authentication.js";

const multipart = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_MEDIA_BYTES, files: 1 },
});

function pathParameter(value: string | string[] | undefined): string {
  return Array.isArray(value) ? (value[0] ?? "") : (value ?? "");
}

export function createMediaRouter(input: {
  identityRepository: IdentityAccessRepository;
  mediaService: MediaService;
  resolveSessionUser: ResolveSessionUser;
}): ReturnType<typeof Router> {
  const router = Router();
  const authenticate = requireAuthenticatedActor(
    input.resolveSessionUser,
    input.identityRepository,
  );

  router.get("/media/:mediaId", async (request, response) => {
    const mediaId = mediaIdSchema.parse(pathParameter(request.params.mediaId));
    response.status(200).json(await input.mediaService.getById(mediaId));
  });

  router.post(
    "/media",
    authenticate,
    requirePermission(PERMISSIONS.MEDIA_UPLOAD),
    multipart.single("file"),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      if (!request.file) throw new MediaValidationError("One image file is required");
      response.status(201).json(
        await input.mediaService.upload(response.locals.actor, {
          bytes: request.file.buffer,
          mimeType: request.file.mimetype,
          originalName: request.file.originalname,
        }),
      );
    },
  );

  router.delete(
    "/media/:mediaId",
    authenticate,
    requirePermission(PERMISSIONS.MEDIA_DELETE),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const mediaId = mediaIdSchema.parse(pathParameter(request.params.mediaId));
      await input.mediaService.delete(response.locals.actor, mediaId);
      response.sendStatus(204);
    },
  );

  const errorHandler: ErrorRequestHandler = (error, _request, response, _next) => {
    if (error instanceof multer.MulterError) {
      response.status(400).json({
        error: "invalid_media_upload",
        message:
          error.code === "LIMIT_FILE_SIZE" ? "Image must not exceed 2 MB" : "Invalid media upload",
      });
      return;
    }
    if (error instanceof z.ZodError) {
      response.status(400).json({ error: "invalid_media", issues: error.issues });
      return;
    }
    if (error instanceof MediaValidationError) {
      response.status(400).json({ error: "invalid_media", message: error.message });
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
    if (error instanceof MediaNotFoundError) {
      response.status(404).json({ error: "not_found", message: error.message });
      return;
    }
    if (error instanceof MediaConflictError) {
      response.status(409).json({ error: "media_conflict", message: error.message });
      return;
    }
    if (error instanceof FileStorageError) {
      response.status(502).json({ error: "storage_unavailable" });
      return;
    }
    response.status(500).json({ error: "internal_error" });
  };
  router.use(errorHandler);

  return router;
}
