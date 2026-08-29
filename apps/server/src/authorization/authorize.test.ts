import { describe, expect, test } from "bun:test";

import { RESOURCE_SCOPES, RESOURCE_TYPES } from "./access-profiles.js";
import {
  ACCESS_PROFILE_CODES,
  ACCOUNT_STATUSES,
  PERMISSION_EFFECTS,
  ROLES,
  type AuthorizationActor,
} from "./authorization.types.js";
import { AuthorizationError, authorizeResource, can } from "./authorize.js";
import { PERMISSIONS } from "./permissions.js";

function actor(overrides: Partial<AuthorizationActor> = {}): AuthorizationActor {
  return {
    userId: "user-1",
    roleCode: ROLES.MENTEE,
    accessProfileCode: ACCESS_PROFILE_CODES.MENTEE_DEFAULT,
    accountStatus: ACCOUNT_STATUSES.ACTIVE,
    overrides: [],
    ...overrides,
  };
}

describe("authorization", () => {
  test("grants a permission through the configured access profile", () => {
    expect(can(actor(), PERMISSIONS.CONTENT_READ)).toBe(true);
  });

  test("denies a permission absent from the access profile", () => {
    expect(can(actor(), PERMISSIONS.BOOTCAMP_PUBLISH)).toBe(false);
  });

  test("does not grant capability from role alone", () => {
    expect(can(actor({ roleCode: ROLES.COO }), PERMISSIONS.BOOTCAMP_PUBLISH)).toBe(false);
  });

  test("grants Superadmin profile full access", () => {
    expect(
      can(
        actor({
          roleCode: ROLES.SUPERADMIN,
          accessProfileCode: ACCESS_PROFILE_CODES.SUPERADMIN,
        }),
        PERMISSIONS.SYSTEM_MANAGE,
      ),
    ).toBe(true);
  });

  test.each([ACCOUNT_STATUSES.PENDING, ACCOUNT_STATUSES.SUSPENDED, ACCOUNT_STATUSES.DISABLED])(
    "denies normal access for %s accounts",
    (accountStatus) => {
      expect(can(actor({ accountStatus }), PERMISSIONS.CONTENT_READ)).toBe(false);
    },
  );

  test("supports an active allow override", () => {
    expect(
      can(
        actor({
          overrides: [
            {
              permissionKey: PERMISSIONS.BOOTCAMP_PUBLISH,
              effect: PERMISSION_EFFECTS.ALLOW,
              expiresAt: null,
            },
          ],
        }),
        PERMISSIONS.BOOTCAMP_PUBLISH,
      ),
    ).toBe(true);
  });

  test("deny override wins over profile and allow overrides", () => {
    expect(
      can(
        actor({
          accessProfileCode: ACCESS_PROFILE_CODES.OPERATIONS_FULL,
          overrides: [
            {
              permissionKey: PERMISSIONS.BOOTCAMP_PUBLISH,
              effect: PERMISSION_EFFECTS.ALLOW,
              expiresAt: null,
            },
            {
              permissionKey: PERMISSIONS.BOOTCAMP_PUBLISH,
              effect: PERMISSION_EFFECTS.DENY,
              expiresAt: null,
            },
          ],
        }),
        PERMISSIONS.BOOTCAMP_PUBLISH,
      ),
    ).toBe(false);
  });

  test("ignores expired overrides", () => {
    expect(
      can(
        actor({
          overrides: [
            {
              permissionKey: PERMISSIONS.BOOTCAMP_PUBLISH,
              effect: PERMISSION_EFFECTS.ALLOW,
              expiresAt: new Date("2020-01-01T00:00:00Z"),
            },
          ],
        }),
        PERMISSIONS.BOOTCAMP_PUBLISH,
        new Date("2021-01-01T00:00:00Z"),
      ),
    ).toBe(false);
  });

  test("resolves Bootcamp scope from the access profile", () => {
    expect(authorizeResource(actor(), PERMISSIONS.BOOTCAMP_READ, RESOURCE_TYPES.BOOTCAMP)).toBe(
      RESOURCE_SCOPES.ENROLLED,
    );
    expect(
      authorizeResource(
        actor({ accessProfileCode: ACCESS_PROFILE_CODES.MENTOR_DEFAULT }),
        PERMISSIONS.BOOTCAMP_UPDATE,
        RESOURCE_TYPES.BOOTCAMP,
      ),
    ).toBe(RESOURCE_SCOPES.ASSIGNED);
  });

  test("does not let ALL scope grant a missing capability", () => {
    expect(() =>
      authorizeResource(
        actor({ accessProfileCode: ACCESS_PROFILE_CODES.EXECUTIVE_READ }),
        PERMISSIONS.BOOTCAMP_PUBLISH,
        RESOURCE_TYPES.BOOTCAMP,
      ),
    ).toThrow(AuthorizationError);
  });
});
