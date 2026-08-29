import { describe, expect, test } from "bun:test";

import { evaluateEnrollmentKeyStatus } from "./enrollment-key-status.js";
import { ENROLLMENT_KEY_STATUSES, PERSISTED_ENROLLMENT_KEY_STATUSES } from "./enrollment.types.js";

const now = new Date("2026-08-27T00:00:00Z");

describe("effective enrollment key status", () => {
  test.each([
    {
      expected: ENROLLMENT_KEY_STATUSES.INACTIVE,
      input: {
        status: PERSISTED_ENROLLMENT_KEY_STATUSES.INACTIVE,
        expiresAt: new Date("2026-08-26T00:00:00Z"),
        maxUses: 1,
        usageCount: 1,
      },
    },
    {
      expected: ENROLLMENT_KEY_STATUSES.EXPIRED,
      input: {
        status: PERSISTED_ENROLLMENT_KEY_STATUSES.ACTIVE,
        expiresAt: now,
        maxUses: 1,
        usageCount: 1,
      },
    },
    {
      expected: ENROLLMENT_KEY_STATUSES.EXHAUSTED,
      input: {
        status: PERSISTED_ENROLLMENT_KEY_STATUSES.ACTIVE,
        expiresAt: null,
        maxUses: 1,
        usageCount: 1,
      },
    },
    {
      expected: ENROLLMENT_KEY_STATUSES.ACTIVE,
      input: {
        status: PERSISTED_ENROLLMENT_KEY_STATUSES.ACTIVE,
        expiresAt: null,
        maxUses: 2,
        usageCount: 1,
      },
    },
  ])("derives $expected", ({ expected, input }) => {
    expect(evaluateEnrollmentKeyStatus(input, now)).toBe(expected);
  });
});
