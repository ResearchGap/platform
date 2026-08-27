import { Router, type ErrorRequestHandler, type Response } from "express";
import { z } from "zod";

import { AuthorizationError } from "../../../authorization/authorize";
import { PERMISSIONS } from "../../../authorization/permissions";
import {
  BootcampNotEnrollableError,
  EnrollmentConflictError,
  EnrollmentEligibilityError,
  EnrollmentKeyInvalidError,
  EnrollmentKeyUnavailableError,
  EnrollmentNotFoundError,
} from "../../../modules/enrollment/enrollment.errors";
import {
  assignMentorSchema,
  createEnrollmentKeySchema,
  eligibleMentorListSchema,
  enrollmentKeyListSchema,
  enrollmentResourceIdSchema,
  mentorListSchema,
  myBootcampListSchema,
  participantListSchema,
  redeemEnrollmentKeySchema,
} from "../../../modules/enrollment/enrollment.schema";
import type { EnrollmentService } from "../../../modules/enrollment/enrollment.service";
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

export function createEnrollmentRouter(input: {
  enrollmentService: EnrollmentService;
  identityRepository: IdentityAccessRepository;
  resolveSessionUser: ResolveSessionUser;
}): ReturnType<typeof Router> {
  const router = Router();
  const authenticate = requireAuthenticatedActor(
    input.resolveSessionUser,
    input.identityRepository,
  );

  router.post(
    "/bootcamps/:bootcampId/enrollment-keys",
    authenticate,
    requirePermission(PERMISSIONS.BOOTCAMP_ENROLLMENT_KEY_MANAGE),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const bootcampId = enrollmentResourceIdSchema.parse(pathParameter(request.params.bootcampId));
      const key = createEnrollmentKeySchema.parse(request.body);
      response
        .status(201)
        .json(await input.enrollmentService.createKey(response.locals.actor, bootcampId, key));
    },
  );

  router.get(
    "/bootcamps/:bootcampId/enrollment-keys",
    authenticate,
    requirePermission(PERMISSIONS.BOOTCAMP_ENROLLMENT_KEY_MANAGE),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const bootcampId = enrollmentResourceIdSchema.parse(pathParameter(request.params.bootcampId));
      const query = enrollmentKeyListSchema.parse(request.query);
      response
        .status(200)
        .json(await input.enrollmentService.listKeys(response.locals.actor, bootcampId, query));
    },
  );

  router.post(
    "/bootcamps/:bootcampId/enrollment-keys/:keyId/deactivate",
    authenticate,
    requirePermission(PERMISSIONS.BOOTCAMP_ENROLLMENT_KEY_MANAGE),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const bootcampId = enrollmentResourceIdSchema.parse(pathParameter(request.params.bootcampId));
      const keyId = enrollmentResourceIdSchema.parse(pathParameter(request.params.keyId));
      response
        .status(200)
        .json(
          await input.enrollmentService.deactivateKey(response.locals.actor, bootcampId, keyId),
        );
    },
  );

  router.post(
    "/bootcamps/:bootcampId/enroll",
    authenticate,
    requirePermission(PERMISSIONS.BOOTCAMP_ENROLL),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const bootcampId = enrollmentResourceIdSchema.parse(pathParameter(request.params.bootcampId));
      const body = redeemEnrollmentKeySchema.parse(request.body);
      response
        .status(201)
        .json(
          await input.enrollmentService.enrollMentee(response.locals.actor, bootcampId, body.key),
        );
    },
  );

  router.get(
    "/me/bootcamps",
    authenticate,
    requirePermission(PERMISSIONS.ENROLLMENT_READ_OWN),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const query = myBootcampListSchema.parse(request.query);
      response
        .status(200)
        .json(await input.enrollmentService.listMyBootcamps(response.locals.actor, query));
    },
  );

  router.get(
    "/me/bootcamps/:bootcampId",
    authenticate,
    requirePermission(PERMISSIONS.ENROLLMENT_READ_OWN),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const bootcampId = enrollmentResourceIdSchema.parse(pathParameter(request.params.bootcampId));
      response
        .status(200)
        .json(await input.enrollmentService.getMyLearningAccess(response.locals.actor, bootcampId));
    },
  );

  router.post(
    "/bootcamps/:bootcampId/mentors/join",
    authenticate,
    requirePermission(PERMISSIONS.BOOTCAMP_MENTOR_JOIN),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const bootcampId = enrollmentResourceIdSchema.parse(pathParameter(request.params.bootcampId));
      const body = redeemEnrollmentKeySchema.parse(request.body);
      response
        .status(201)
        .json(
          await input.enrollmentService.joinAsMentor(response.locals.actor, bootcampId, body.key),
        );
    },
  );

  router.get(
    "/me/mentor-bootcamps",
    authenticate,
    requirePermission(PERMISSIONS.BOOTCAMP_READ),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const query = mentorListSchema.parse(request.query);
      response
        .status(200)
        .json(await input.enrollmentService.listMyMentorBootcamps(response.locals.actor, query));
    },
  );

  router.get(
    "/mentors/eligible",
    authenticate,
    requirePermission(PERMISSIONS.BOOTCAMP_MENTOR_ASSIGN),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const query = eligibleMentorListSchema.parse(request.query);
      response
        .status(200)
        .json(await input.enrollmentService.listEligibleMentors(response.locals.actor, query));
    },
  );

  router.post(
    "/bootcamps/:bootcampId/mentors",
    authenticate,
    requirePermission(PERMISSIONS.BOOTCAMP_MENTOR_ASSIGN),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const bootcampId = enrollmentResourceIdSchema.parse(pathParameter(request.params.bootcampId));
      const body = assignMentorSchema.parse(request.body);
      response
        .status(201)
        .json(
          await input.enrollmentService.assignMentor(
            response.locals.actor,
            bootcampId,
            body.mentorId,
          ),
        );
    },
  );

  router.get(
    "/bootcamps/:bootcampId/mentors",
    authenticate,
    requirePermission(PERMISSIONS.BOOTCAMP_PARTICIPANT_READ),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const bootcampId = enrollmentResourceIdSchema.parse(pathParameter(request.params.bootcampId));
      const query = mentorListSchema.parse(request.query);
      response
        .status(200)
        .json(await input.enrollmentService.listMentors(response.locals.actor, bootcampId, query));
    },
  );

  router.delete(
    "/bootcamps/:bootcampId/mentors/:mentorId",
    authenticate,
    requirePermission(PERMISSIONS.BOOTCAMP_MENTOR_ASSIGN),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const bootcampId = enrollmentResourceIdSchema.parse(pathParameter(request.params.bootcampId));
      const mentorId = enrollmentResourceIdSchema.parse(pathParameter(request.params.mentorId));
      await input.enrollmentService.removeMentor(response.locals.actor, bootcampId, mentorId);
      response.status(204).send();
    },
  );

  router.get(
    "/bootcamps/:bootcampId/participants",
    authenticate,
    requirePermission(PERMISSIONS.BOOTCAMP_PARTICIPANT_READ),
    async (request, response: Response<unknown, AuthenticatedResponseLocals>) => {
      const bootcampId = enrollmentResourceIdSchema.parse(pathParameter(request.params.bootcampId));
      const query = participantListSchema.parse(request.query);
      response
        .status(200)
        .json(
          await input.enrollmentService.listParticipants(response.locals.actor, bootcampId, query),
        );
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
    if (error instanceof EnrollmentNotFoundError) {
      response.status(404).json({ error: "not_found", message: error.message });
      return;
    }
    if (error instanceof EnrollmentKeyInvalidError || error instanceof EnrollmentEligibilityError) {
      response.status(400).json({ error: "invalid_enrollment", message: error.message });
      return;
    }
    if (
      error instanceof EnrollmentKeyUnavailableError ||
      error instanceof BootcampNotEnrollableError ||
      error instanceof EnrollmentConflictError
    ) {
      response.status(409).json({ error: "enrollment_conflict", message: error.message });
      return;
    }
    response.status(500).json({ error: "internal_error" });
  };
  router.use(errorHandler);

  return router;
}
