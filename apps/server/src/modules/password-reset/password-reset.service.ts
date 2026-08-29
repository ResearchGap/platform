import { randomUUID } from "node:crypto";

import { authorize } from "../../authorization/authorize.js";
import { PERMISSIONS } from "../../authorization/permissions.js";
import type { EmailSender } from "./email-sender.js";
import {
  InvalidPasswordResetError,
  PasswordResetConflictError,
  PasswordResetNotFoundError,
} from "./password-reset.errors.js";
import type {
  NativePasswordResetProvider,
  PasswordResetRepository,
} from "./password-reset.repository.js";
import type { ResetLinkCipher } from "./reset-link-cipher.js";
import {
  PASSWORD_RESET_DELIVERY_MODES,
  PASSWORD_RESET_SOURCES,
  PASSWORD_RESET_STATUSES,
  type PasswordResetDeliveryMode,
  type PasswordResetRecord,
  type PasswordResetRequestDto,
  type PasswordResetSupportInput,
} from "./password-reset.types.js";

const TOKEN_LIFETIME_MS = 60 * 60 * 1000;
const RATE_WINDOW_MS = 15 * 60 * 1000;
const EMAIL_RATE_LIMIT = 5;
const IP_RATE_LIMIT = 20;
const MINIMUM_PUBLIC_RESPONSE_MS = 500;

export const PASSWORD_RESET_PUBLIC_MESSAGE =
  "If an account exists for this email, a password reset link has been sent.";

export class PasswordResetService {
  constructor(
    private readonly repository: PasswordResetRepository,
    private readonly provider: NativePasswordResetProvider,
    private readonly emailSender: EmailSender,
    private readonly cipher: ResetLinkCipher,
    private readonly publicOrigin: string,
  ) {}

  async request(input: {
    email: string;
    ipAddress: string | null;
    userAgent: string | null;
  }): Promise<{ message: string }> {
    const startedAt = Date.now();
    const email = normalizeEmail(input.email);
    const requestId = randomUUID();

    await this.repository.create({
      id: requestId,
      requestedEmail: email,
      userId: null,
      source: PASSWORD_RESET_SOURCES.SELF_SERVICE,
      deliveryMode: PASSWORD_RESET_DELIVERY_MODES.EMAIL,
      requestedById: null,
      ipAddress: input.ipAddress,
      userAgent: input.userAgent,
    });

    const user = await this.repository.findUserByEmail(email);
    if (!user) {
      await this.repository.updateStatus({
        requestId,
        status: PASSWORD_RESET_STATUSES.NO_ACCOUNT,
      });
      await ensureMinimumDuration(startedAt);
      return { message: PASSWORD_RESET_PUBLIC_MESSAGE };
    }

    await this.repository.attachUser(requestId, user.id);
    const recent = await this.repository.countRecent({
      email,
      ipAddress: input.ipAddress,
      since: new Date(Date.now() - RATE_WINDOW_MS),
    });
    if (recent.byEmail > EMAIL_RATE_LIMIT || recent.byIp > IP_RATE_LIMIT) {
      await this.repository.updateStatus({
        requestId,
        status: PASSWORD_RESET_STATUSES.DELIVERY_FAILED,
        safeDeliveryError: "RATE_LIMITED",
      });
      await ensureMinimumDuration(startedAt);
      return { message: PASSWORD_RESET_PUBLIC_MESSAGE };
    }

    try {
      await this.provider.issue({
        requestId,
        email: user.email,
        deliveryMode: PASSWORD_RESET_DELIVERY_MODES.EMAIL,
        redirectTo: resetRedirectUrl(this.publicOrigin, requestId),
      });
    } catch {
      const current = await this.repository.findById(requestId);
      if (current?.status !== PASSWORD_RESET_STATUSES.DELIVERY_FAILED) {
        await this.repository.updateStatus({
          requestId,
          status: PASSWORD_RESET_STATUSES.DELIVERY_FAILED,
          safeDeliveryError: "RESET_ISSUANCE_FAILED",
        });
      }
    }

    await ensureMinimumDuration(startedAt);
    return { message: PASSWORD_RESET_PUBLIC_MESSAGE };
  }

  async handleIssuedLink(input: {
    deliveryMode: PasswordResetDeliveryMode;
    requestId: string;
    url: string;
    user: { email: string };
  }): Promise<void> {
    const expiresAt = new Date(Date.now() + TOKEN_LIFETIME_MS);
    const encryptedUrl = this.cipher.encrypt(input.url);
    await this.repository.recordIssued({
      requestId: input.requestId,
      expiresAt,
      resetUrlEncrypted: encryptedUrl,
    });

    if (input.deliveryMode === PASSWORD_RESET_DELIVERY_MODES.MANUAL) {
      await this.repository.updateStatus({
        requestId: input.requestId,
        status: PASSWORD_RESET_STATUSES.MANUAL_READY,
      });
      return;
    }

    try {
      const message = resetEmail(input.url);
      await this.emailSender.send({ to: input.user.email, ...message });
      await this.repository.updateStatus({
        requestId: input.requestId,
        status: PASSWORD_RESET_STATUSES.EMAIL_SENT,
        emailSentAt: new Date(),
      });
    } catch (error) {
      await this.repository.updateStatus({
        requestId: input.requestId,
        status: PASSWORD_RESET_STATUSES.DELIVERY_FAILED,
        safeDeliveryError: safeDeliveryError(error),
      });
      throw error;
    }
  }

  async complete(input: { newPassword: string; requestId: string; token: string }): Promise<void> {
    const request = await this.repository.findById(input.requestId);
    if (
      !request?.userId ||
      request.status === PASSWORD_RESET_STATUSES.COMPLETED ||
      !request.expiresAt ||
      request.expiresAt <= new Date()
    ) {
      throw new InvalidPasswordResetError();
    }

    let result: { userId: string };
    try {
      result = await this.provider.complete(input);
    } catch {
      throw new InvalidPasswordResetError();
    }
    if (result.userId !== request.userId) {
      throw new InvalidPasswordResetError();
    }

    const completed = await this.repository.markCompleted(input.requestId, new Date());
    if (!completed) {
      throw new InvalidPasswordResetError();
    }
  }

  async listForUser(input: PasswordResetSupportInput): Promise<PasswordResetRequestDto[]> {
    authorize(input.actor, PERMISSIONS.PASSWORD_RESET_ASSIST);
    const requests = await this.repository.listForUser(input.userId, 20);
    return requests.map(toDto);
  }

  async createManual(input: PasswordResetSupportInput): Promise<PasswordResetRequestDto> {
    authorize(input.actor, PERMISSIONS.PASSWORD_RESET_ASSIST);
    const user = await this.repository.findUserById(input.userId);
    if (!user) {
      throw new PasswordResetNotFoundError();
    }

    const requestId = randomUUID();
    await this.repository.create({
      id: requestId,
      requestedEmail: normalizeEmail(user.email),
      userId: user.id,
      source: PASSWORD_RESET_SOURCES.SUPPORT,
      deliveryMode: PASSWORD_RESET_DELIVERY_MODES.MANUAL,
      requestedById: input.actor.userId,
      ipAddress: null,
      userAgent: null,
    });
    try {
      await this.provider.issue({
        requestId,
        email: user.email,
        deliveryMode: PASSWORD_RESET_DELIVERY_MODES.MANUAL,
        redirectTo: resetRedirectUrl(this.publicOrigin, requestId),
      });
    } catch {
      await this.repository.updateStatus({
        requestId,
        status: PASSWORD_RESET_STATUSES.DELIVERY_FAILED,
        safeDeliveryError: "RESET_ISSUANCE_FAILED",
      });
      throw new PasswordResetConflictError("A new manual reset link could not be generated");
    }

    const created = await this.repository.findById(requestId);
    if (!created) {
      throw new PasswordResetNotFoundError();
    }
    return toDto(created);
  }

  async reveal(input: { actor: PasswordResetSupportInput["actor"]; requestId: string }) {
    authorize(input.actor, PERMISSIONS.PASSWORD_RESET_ASSIST);
    const request = await this.repository.findById(input.requestId);
    const now = new Date();
    if (!request) {
      throw new PasswordResetNotFoundError();
    }
    if (
      !request.userId ||
      !request.resetUrlEncrypted ||
      request.status === PASSWORD_RESET_STATUSES.COMPLETED ||
      !request.expiresAt ||
      request.expiresAt <= now
    ) {
      throw new PasswordResetConflictError(
        "This reset link is unavailable, completed, or expired; generate a new manual link instead",
      );
    }

    const url = this.cipher.decrypt(request.resetUrlEncrypted);
    const recorded = await this.repository.markManuallyRevealed({
      requestId: request.id,
      actorId: input.actor.userId,
      revealedAt: now,
    });
    if (!recorded) {
      throw new PasswordResetConflictError("This reset link can no longer be revealed");
    }
    return { url };
  }
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function resetRedirectUrl(publicOrigin: string, requestId: string): string {
  const url = new URL("/reset-password", publicOrigin);
  url.searchParams.set("requestId", requestId);
  return url.toString();
}

function effectiveStatus(request: PasswordResetRecord): PasswordResetRequestDto["effectiveStatus"] {
  if (
    request.status !== PASSWORD_RESET_STATUSES.COMPLETED &&
    request.expiresAt &&
    request.expiresAt <= new Date()
  ) {
    return "EXPIRED";
  }
  return request.status;
}

function toDto(request: PasswordResetRecord): PasswordResetRequestDto {
  return {
    id: request.id,
    source: request.source,
    deliveryMode: request.deliveryMode,
    status: request.status,
    effectiveStatus: effectiveStatus(request),
    requestedAt: request.requestedAt.toISOString(),
    expiresAt: request.expiresAt?.toISOString() ?? null,
    emailSentAt: request.emailSentAt?.toISOString() ?? null,
    completedAt: request.completedAt?.toISOString() ?? null,
    manuallyRevealedAt: request.manuallyRevealedAt?.toISOString() ?? null,
    requestedBy: request.requestedBy,
  };
}

async function ensureMinimumDuration(startedAt: number): Promise<void> {
  const remaining = MINIMUM_PUBLIC_RESPONSE_MS - (Date.now() - startedAt);
  if (remaining > 0) {
    await new Promise((resolve) => setTimeout(resolve, remaining));
  }
}

function safeDeliveryError(error: unknown): string {
  if (typeof error === "object" && error !== null && "code" in error) {
    const code = String(error.code);
    if (["EAUTH", "ECONNECTION", "ETIMEDOUT", "EENVELOPE", "EMESSAGE"].includes(code)) {
      return code;
    }
  }
  return "SMTP_DELIVERY_FAILED";
}

function resetEmail(url: string) {
  return {
    subject: "Reset your ResearchGap password",
    html: `<!doctype html><html><body style="font-family:Arial,sans-serif;color:#24183a"><h1 style="color:#6d28d9">ResearchGap</h1><p>We received a request to reset your ResearchGap password.</p><p><a href="${escapeHtml(url)}" style="display:inline-block;background:#6d28d9;color:#fff;padding:12px 20px;border-radius:8px;text-decoration:none">Reset Password</a></p><p>This link expires in 1 hour.</p><p>If you did not request this change, you can safely ignore this message.</p></body></html>`,
    text: `ResearchGap password reset\n\nOpen this link to reset your password: ${url}\n\nThis link expires in 1 hour. If you did not request this change, you can safely ignore this message.`,
  };
}

function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => {
    const entities: Record<string, string> = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character] ?? character;
  });
}
