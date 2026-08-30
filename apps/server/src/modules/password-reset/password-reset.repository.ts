import type {
  PasswordResetDeliveryMode,
  PasswordResetRecord,
  PasswordResetSource,
  PasswordResetStatus,
} from "./password-reset.types.js";

export const PASSWORD_RESET_DELIVERY_IN_PROGRESS = "DELIVERY_IN_PROGRESS";

export interface PasswordResetRepository {
  attachUser(requestId: string, userId: string): Promise<void>;
  countRecent(input: { email: string; ipAddress: string | null; since: Date }): Promise<{
    byEmail: number;
    byIp: number;
  }>;
  getEmailDeliveryState(input: {
    email: string;
    excludeRequestId: string;
    failureSince: Date;
    inFlightSince: Date;
    successfulSince: Date;
  }): Promise<{
    hasInFlightDelivery: boolean;
    latestFailedRequestAt: Date | null;
    latestSuccessfulEmailSentAt: Date | null;
    successfulDeliveryCount: number;
  }>;
  create(input: {
    deliveryMode: PasswordResetDeliveryMode;
    id: string;
    ipAddress: string | null;
    requestedById: string | null;
    requestedEmail: string;
    source: PasswordResetSource;
    userAgent: string | null;
    userId: string | null;
  }): Promise<void>;
  findById(requestId: string): Promise<PasswordResetRecord | null>;
  findUserByEmail(email: string): Promise<{ email: string; id: string } | null>;
  findUserById(userId: string): Promise<{ email: string; id: string } | null>;
  listForUser(userId: string, limit: number): Promise<PasswordResetRecord[]>;
  markCompleted(requestId: string, completedAt: Date): Promise<boolean>;
  markManuallyRevealed(input: {
    actorId: string;
    requestId: string;
    revealedAt: Date;
  }): Promise<boolean>;
  recordIssued(input: {
    expiresAt: Date;
    requestId: string;
    resetUrlEncrypted: string;
  }): Promise<void>;
  updateStatus(input: {
    emailSentAt?: Date;
    requestId: string;
    safeDeliveryError?: string | null;
    status: PasswordResetStatus;
  }): Promise<void>;
  withEmailDeliveryLock<T>(email: string, operation: () => Promise<T>): Promise<T>;
}

export interface NativePasswordResetProvider {
  complete(input: { newPassword: string; requestId: string; token: string }): Promise<{
    userId: string;
  }>;
  issue(input: {
    deliveryMode: PasswordResetDeliveryMode;
    email: string;
    redirectTo: string;
    requestId: string;
  }): Promise<void>;
}
