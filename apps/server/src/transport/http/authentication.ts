import type { NextFunction, Request, Response } from "express";

import { AuthorizationError, authorize } from "../../authorization/authorize";
import type { AuthorizationActor } from "../../authorization/authorization.types";
import type { Permission } from "../../authorization/permissions";
import type { IdentityAccessRepository } from "../../modules/identity/identity.repository";

export type ResolveSessionUser = (headers: Request["headers"]) => Promise<{ id: string } | null>;

export class AuthenticationError extends Error {
  constructor() {
    super("Authentication is required");
    this.name = "AuthenticationError";
  }
}

export interface AuthenticatedResponseLocals {
  actor: AuthorizationActor;
}

export function requireAuthenticatedActor(
  resolveSessionUser: ResolveSessionUser,
  repository: IdentityAccessRepository,
) {
  return async (
    request: Request,
    response: Response<unknown, AuthenticatedResponseLocals>,
    next: NextFunction,
  ) => {
    try {
      const user = await resolveSessionUser(request.headers);
      if (!user) {
        throw new AuthenticationError();
      }

      const actor = await repository.findActor(user.id);
      if (!actor) {
        throw new AuthorizationError("Application access has not been initialized");
      }

      response.locals.actor = actor;
      next();
    } catch (error) {
      next(error);
    }
  };
}

export function requirePermission(permission: Permission) {
  return (
    _request: Request,
    response: Response<unknown, AuthenticatedResponseLocals>,
    next: NextFunction,
  ) => {
    try {
      authorize(response.locals.actor, permission);
      next();
    } catch (error) {
      next(error);
    }
  };
}
