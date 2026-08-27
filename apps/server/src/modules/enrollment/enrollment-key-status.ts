import {
  ENROLLMENT_KEY_STATUSES,
  PERSISTED_ENROLLMENT_KEY_STATUSES,
  type EnrollmentKeyStatus,
  type PersistedEnrollmentKeyStatus,
} from "./enrollment.types";

export interface EnrollmentKeyStateInput {
  expiresAt: Date | null;
  maxUses: number | null;
  status: PersistedEnrollmentKeyStatus;
  usageCount: number;
}

export function evaluateEnrollmentKeyStatus(
  key: EnrollmentKeyStateInput,
  now: Date,
): EnrollmentKeyStatus {
  if (key.status === PERSISTED_ENROLLMENT_KEY_STATUSES.INACTIVE) {
    return ENROLLMENT_KEY_STATUSES.INACTIVE;
  }
  if (key.expiresAt && key.expiresAt <= now) {
    return ENROLLMENT_KEY_STATUSES.EXPIRED;
  }
  if (key.maxUses !== null && key.usageCount >= key.maxUses) {
    return ENROLLMENT_KEY_STATUSES.EXHAUSTED;
  }
  return ENROLLMENT_KEY_STATUSES.ACTIVE;
}
