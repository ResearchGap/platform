import { ACCESS_PROFILES, FULL_ACCESS } from "./access-profiles";
import {
  ACCOUNT_STATUSES,
  PERMISSION_EFFECTS,
  type AuthorizationActor,
} from "./authorization.types";
import { isPermission, type Permission } from "./permissions";

export class AuthorizationError extends Error {
  constructor(message = "You are not authorized to perform this operation") {
    super(message);
    this.name = "AuthorizationError";
  }
}

function activeOverrides(actor: AuthorizationActor, now: Date) {
  return actor.overrides.filter(
    (override) => override.expiresAt === null || override.expiresAt > now,
  );
}

export function can(
  actor: AuthorizationActor | null,
  permission: Permission,
  now = new Date(),
): boolean {
  if (!actor || actor.accountStatus !== ACCOUNT_STATUSES.ACTIVE) {
    return false;
  }

  const overrides = activeOverrides(actor, now).filter(
    (override) => override.permissionKey === permission && isPermission(override.permissionKey),
  );

  if (overrides.some((override) => override.effect === PERMISSION_EFFECTS.DENY)) {
    return false;
  }

  if (overrides.some((override) => override.effect === PERMISSION_EFFECTS.ALLOW)) {
    return true;
  }

  const profilePermissions = ACCESS_PROFILES[actor.accessProfileCode];
  return profilePermissions.includes(FULL_ACCESS) || profilePermissions.includes(permission);
}

export function authorize(
  actor: AuthorizationActor | null,
  permission: Permission,
  now = new Date(),
): asserts actor is AuthorizationActor {
  if (!can(actor, permission, now)) {
    throw new AuthorizationError();
  }
}
