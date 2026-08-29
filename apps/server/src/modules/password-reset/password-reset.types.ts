import type { AuthorizationActor } from "../../authorization/authorization.types.js";

export const PASSWORD_RESET_SOURCES = {
  SELF_SERVICE: "SELF_SERVICE",
  SUPPORT: "SUPPORT",
} as const;

export type PasswordResetSource =
  (typeof PASSWORD_RESET_SOURCES)[keyof typeof PASSWORD_RESET_SOURCES];

export const PASSWORD_RESET_DELIVERY_MODES = {
  EMAIL: "EMAIL",
  MANUAL: "MANUAL",
} as const;

export type PasswordResetDeliveryMode =
  (typeof PASSWORD_RESET_DELIVERY_MODES)[keyof typeof PASSWORD_RESET_DELIVERY_MODES];

export const PASSWORD_RESET_STATUSES = {
  REQUESTED: "REQUESTED",
  NO_ACCOUNT: "NO_ACCOUNT",
  EMAIL_SENT: "EMAIL_SENT",
  DELIVERY_FAILED: "DELIVERY_FAILED",
  MANUAL_READY: "MANUAL_READY",
  COMPLETED: "COMPLETED",
} as const;

export type PasswordResetStatus =
  (typeof PASSWORD_RESET_STATUSES)[keyof typeof PASSWORD_RESET_STATUSES];

export type PasswordResetEffectiveStatus = PasswordResetStatus | "EXPIRED";

export interface PasswordResetRecord {
  completedAt: Date | null;
  deliveryMode: PasswordResetDeliveryMode;
  emailSentAt: Date | null;
  expiresAt: Date | null;
  id: string;
  manuallyRevealedAt: Date | null;
  requestedAt: Date;
  requestedBy: { id: string; name: string } | null;
  requestedEmail: string;
  resetUrlEncrypted: string | null;
  safeDeliveryError: string | null;
  source: PasswordResetSource;
  status: PasswordResetStatus;
  userId: string | null;
}

export interface PasswordResetRequestDto {
  completedAt: string | null;
  deliveryMode: PasswordResetDeliveryMode;
  effectiveStatus: PasswordResetEffectiveStatus;
  emailSentAt: string | null;
  expiresAt: string | null;
  id: string;
  manuallyRevealedAt: string | null;
  requestedAt: string;
  requestedBy: { id: string; name: string } | null;
  source: PasswordResetSource;
  status: PasswordResetStatus;
}

export interface PasswordResetSupportInput {
  actor: AuthorizationActor;
  userId: string;
}
