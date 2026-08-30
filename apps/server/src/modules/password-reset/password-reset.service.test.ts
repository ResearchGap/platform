import { describe, expect, test } from "bun:test";

import { AuthorizationError } from "../../authorization/authorize.js";
import {
  ACCESS_PROFILE_CODES,
  ACCOUNT_STATUSES,
  ROLES,
  type AuthorizationActor,
} from "../../authorization/authorization.types.js";
import type { EmailSender } from "./email-sender.js";
import { PasswordResetConflictError } from "./password-reset.errors.js";
import type {
  NativePasswordResetProvider,
  PasswordResetRepository,
} from "./password-reset.repository.js";
import { PASSWORD_RESET_DELIVERY_IN_PROGRESS } from "./password-reset.repository.js";
import { PasswordResetService, PASSWORD_RESET_PUBLIC_MESSAGE } from "./password-reset.service.js";
import type { ResetLinkCipher } from "./reset-link-cipher.js";
import {
  PASSWORD_RESET_DELIVERY_MODES,
  PASSWORD_RESET_SOURCES,
  PASSWORD_RESET_STATUSES,
  type PasswordResetRecord,
} from "./password-reset.types.js";

class FakeRepository implements PasswordResetRepository {
  readonly records = new Map<string, PasswordResetRecord>();
  private readonly locks = new Map<string, Promise<void>>();
  user: { email: string; id: string } | null = null;

  constructor(private readonly now: () => Date) {}

  async create(input: Parameters<PasswordResetRepository["create"]>[0]) {
    this.records.set(input.id, {
      id: input.id,
      requestedEmail: input.requestedEmail,
      userId: input.userId,
      source: input.source,
      deliveryMode: input.deliveryMode,
      status: PASSWORD_RESET_STATUSES.REQUESTED,
      requestedAt: this.now(),
      expiresAt: null,
      emailSentAt: null,
      completedAt: null,
      manuallyRevealedAt: null,
      requestedBy: input.requestedById ? { id: input.requestedById, name: "Support" } : null,
      resetUrlEncrypted: null,
      safeDeliveryError: null,
    });
  }

  async attachUser(requestId: string, userId: string) {
    this.record(requestId).userId = userId;
  }

  async countRecent() {
    return { byEmail: 1, byIp: 1 };
  }

  async getEmailDeliveryState(
    input: Parameters<PasswordResetRepository["getEmailDeliveryState"]>[0],
  ) {
    const records = [...this.records.values()].filter(
      (record) => record.requestedEmail === input.email && record.id !== input.excludeRequestId,
    );
    const successful = records
      .filter((record) => record.emailSentAt !== null)
      .sort(
        (left, right) =>
          (right.emailSentAt as Date).getTime() - (left.emailSentAt as Date).getTime(),
      );
    const failed = records
      .filter(
        (record) =>
          record.deliveryMode === PASSWORD_RESET_DELIVERY_MODES.EMAIL &&
          record.status === PASSWORD_RESET_STATUSES.DELIVERY_FAILED &&
          record.requestedAt >= input.failureSince,
      )
      .sort((left, right) => right.requestedAt.getTime() - left.requestedAt.getTime());
    return {
      hasInFlightDelivery: records.some(
        (record) =>
          record.status === PASSWORD_RESET_STATUSES.REQUESTED &&
          record.deliveryMode === PASSWORD_RESET_DELIVERY_MODES.EMAIL &&
          record.safeDeliveryError === PASSWORD_RESET_DELIVERY_IN_PROGRESS &&
          record.requestedAt >= input.inFlightSince,
      ),
      latestFailedRequestAt: failed[0]?.requestedAt ?? null,
      latestSuccessfulEmailSentAt: successful[0]?.emailSentAt ?? null,
      successfulDeliveryCount: successful.filter(
        (record) => (record.emailSentAt as Date) >= input.successfulSince,
      ).length,
    };
  }

  async findById(requestId: string) {
    return this.records.get(requestId) ?? null;
  }

  async findUserByEmail() {
    return this.user;
  }

  async findUserById() {
    return this.user;
  }

  async listForUser(userId: string, limit: number) {
    return [...this.records.values()].filter((record) => record.userId === userId).slice(0, limit);
  }

  async markCompleted(requestId: string, completedAt: Date) {
    const record = this.record(requestId);
    if (record.status === PASSWORD_RESET_STATUSES.COMPLETED || !record.expiresAt) return false;
    record.status = PASSWORD_RESET_STATUSES.COMPLETED;
    record.completedAt = completedAt;
    return true;
  }

  async markManuallyRevealed(
    input: Parameters<PasswordResetRepository["markManuallyRevealed"]>[0],
  ) {
    this.record(input.requestId).manuallyRevealedAt = input.revealedAt;
    return true;
  }

  async recordIssued(input: Parameters<PasswordResetRepository["recordIssued"]>[0]) {
    const record = this.record(input.requestId);
    record.expiresAt = input.expiresAt;
    record.resetUrlEncrypted = input.resetUrlEncrypted;
  }

  async updateStatus(input: Parameters<PasswordResetRepository["updateStatus"]>[0]) {
    const record = this.record(input.requestId);
    record.status = input.status;
    record.emailSentAt = input.emailSentAt ?? record.emailSentAt;
    if (input.safeDeliveryError !== undefined) {
      record.safeDeliveryError = input.safeDeliveryError;
    }
  }

  async withEmailDeliveryLock<T>(email: string, operation: () => Promise<T>): Promise<T> {
    const previous = this.locks.get(email) ?? Promise.resolve();
    let release: (() => void) | undefined;
    const current = new Promise<void>((resolve) => {
      release = resolve;
    });
    this.locks.set(email, current);
    await previous;
    try {
      return await operation();
    } finally {
      release?.();
      if (this.locks.get(email) === current) this.locks.delete(email);
    }
  }

  private record(id: string) {
    const record = this.records.get(id);
    if (!record) throw new Error("Missing fake record");
    return record;
  }
}

class FakeCipher implements ResetLinkCipher {
  private readonly values = new Map<string, string>();

  encrypt(plaintext: string) {
    const ciphertext = `ciphertext-${this.values.size + 1}`;
    this.values.set(ciphertext, plaintext);
    return ciphertext;
  }

  decrypt(ciphertext: string) {
    const plaintext = this.values.get(ciphertext);
    if (!plaintext) throw new Error("Invalid ciphertext");
    return plaintext;
  }
}

class FakeEmailSender implements EmailSender {
  attempts = 0;
  fail = false;

  async send() {
    this.attempts += 1;
    if (this.fail) throw Object.assign(new Error("SMTP unavailable"), { code: "ECONNECTION" });
  }
}

class FakeProvider implements NativePasswordResetProvider {
  issueCalls = 0;
  service?: PasswordResetService;

  async issue(input: Parameters<NativePasswordResetProvider["issue"]>[0]) {
    this.issueCalls += 1;
    await this.service?.handleIssuedLink({
      requestId: input.requestId,
      deliveryMode: input.deliveryMode,
      url: `https://example.test/api/auth/reset-password/native-token?callbackURL=${encodeURIComponent(input.redirectTo)}`,
      user: { email: input.email },
    });
  }

  async complete() {
    return { userId: "user-1" };
  }
}

function setup() {
  let currentTime = new Date("2026-08-29T10:00:00.000Z");
  const now = () => new Date(currentTime);
  const repository = new FakeRepository(now);
  const provider = new FakeProvider();
  const sender = new FakeEmailSender();
  const service = new PasswordResetService(
    repository,
    provider,
    sender,
    new FakeCipher(),
    "https://app.example.test",
    { now, minimumPublicResponseMs: 0 },
  );
  provider.service = service;
  return {
    provider,
    repository,
    sender,
    service,
    setNow(value: string) {
      currentTime = new Date(value);
    },
  };
}

function superadminActor(): AuthorizationActor {
  return {
    userId: "support-1",
    roleCode: ROLES.SUPERADMIN,
    accessProfileCode: ACCESS_PROFILE_CODES.SUPERADMIN,
    accountStatus: ACCOUNT_STATUSES.ACTIVE,
    overrides: [],
  };
}

describe("password reset service", () => {
  test("gates unknown accounts before Better Auth or email delivery", async () => {
    const { provider, repository, sender, service } = setup();
    const result = await service.request({
      email: " Unknown@Example.com ",
      ipAddress: "127.0.0.1",
      userAgent: "test",
    });

    const [record] = repository.records.values();
    expect(result.message).toBe(PASSWORD_RESET_PUBLIC_MESSAGE);
    expect(record?.requestedEmail).toBe("unknown@example.com");
    expect(record?.status).toBe(PASSWORD_RESET_STATUSES.NO_ACCOUNT);
    expect(provider.issueCalls).toBe(0);
    expect(sender.attempts).toBe(0);
  });

  test("stores only encrypted application link state and records successful email", async () => {
    const { provider, repository, sender, service } = setup();
    repository.user = { id: "user-1", email: "known@example.com" };
    await service.request({ email: "known@example.com", ipAddress: null, userAgent: null });

    const [record] = repository.records.values();
    expect(provider.issueCalls).toBe(1);
    expect(sender.attempts).toBe(1);
    expect(record?.status).toBe(PASSWORD_RESET_STATUSES.EMAIL_SENT);
    expect(record?.resetUrlEncrypted).toBe("ciphertext-1");
    expect(record?.resetUrlEncrypted).not.toContain("native-token");
  });

  test("retains encrypted link after SMTP delivery failure", async () => {
    const { repository, sender, service } = setup();
    repository.user = { id: "user-1", email: "known@example.com" };
    sender.fail = true;
    await service.request({ email: "known@example.com", ipAddress: null, userAgent: null });

    const [record] = repository.records.values();
    expect(record?.status).toBe(PASSWORD_RESET_STATUSES.DELIVERY_FAILED);
    expect(record?.safeDeliveryError).toBe("ECONNECTION");
    expect(record?.resetUrlEncrypted).toBe("ciphertext-1");
  });

  test("suppresses successful delivery for ten minutes, then permits another send", async () => {
    const { provider, repository, sender, service, setNow } = setup();
    repository.user = { id: "user-1", email: "known@example.com" };

    await service.request({ email: "KNOWN@example.com", ipAddress: null, userAgent: null });
    setNow("2026-08-29T10:05:00.000Z");
    const suppressed = await service.request({
      email: "known@example.com",
      ipAddress: null,
      userAgent: null,
    });

    expect(suppressed).toEqual({ message: PASSWORD_RESET_PUBLIC_MESSAGE });
    expect(provider.issueCalls).toBe(1);
    expect(sender.attempts).toBe(1);

    setNow("2026-08-29T10:10:00.000Z");
    await service.request({ email: "known@example.com", ipAddress: null, userAgent: null });
    expect(provider.issueCalls).toBe(2);
    expect(sender.attempts).toBe(2);
  });

  test("allows two successful deliveries per rolling hour and counts completed requests", async () => {
    const { provider, repository, sender, service, setNow } = setup();
    repository.user = { id: "user-1", email: "known@example.com" };

    await service.request({ email: "known@example.com", ipAddress: null, userAgent: null });
    const first = [...repository.records.values()][0];
    if (!first) throw new Error("Missing first request");
    first.status = PASSWORD_RESET_STATUSES.COMPLETED;
    first.completedAt = new Date("2026-08-29T10:05:00.000Z");

    setNow("2026-08-29T10:12:00.000Z");
    await service.request({ email: "known@example.com", ipAddress: null, userAgent: null });
    setNow("2026-08-29T10:23:00.000Z");
    await service.request({ email: "known@example.com", ipAddress: null, userAgent: null });

    expect(provider.issueCalls).toBe(2);
    expect(sender.attempts).toBe(2);

    setNow("2026-08-29T11:01:00.000Z");
    await service.request({ email: "known@example.com", ipAddress: null, userAgent: null });
    expect(provider.issueCalls).toBe(3);
    expect(sender.attempts).toBe(3);
  });

  test("backs off failed SMTP delivery briefly without counting it toward delivery quota", async () => {
    const { provider, repository, sender, service, setNow } = setup();
    repository.user = { id: "user-1", email: "known@example.com" };
    sender.fail = true;

    await service.request({ email: "known@example.com", ipAddress: null, userAgent: null });
    setNow("2026-08-29T10:00:30.000Z");
    await service.request({ email: "known@example.com", ipAddress: null, userAgent: null });
    expect(provider.issueCalls).toBe(1);
    expect(sender.attempts).toBe(1);

    sender.fail = false;
    setNow("2026-08-29T10:01:00.000Z");
    await service.request({ email: "known@example.com", ipAddress: null, userAgent: null });
    expect(provider.issueCalls).toBe(2);
    expect(sender.attempts).toBe(2);
  });

  test("serializes simultaneous requests so only one delivery is issued", async () => {
    const { provider, repository, sender, service } = setup();
    repository.user = { id: "user-1", email: "known@example.com" };

    const results = await Promise.all([
      service.request({ email: "known@example.com", ipAddress: "127.0.0.1", userAgent: null }),
      service.request({ email: "KNOWN@example.com", ipAddress: "127.0.0.1", userAgent: null }),
    ]);

    expect(results).toEqual([
      { message: PASSWORD_RESET_PUBLIC_MESSAGE },
      { message: PASSWORD_RESET_PUBLIC_MESSAGE },
    ]);
    expect(provider.issueCalls).toBe(1);
    expect(sender.attempts).toBe(1);
  });

  test("authorizes manual generation and records controlled reveal", async () => {
    const { repository, service } = setup();
    repository.user = { id: "user-1", email: "known@example.com" };
    const actor = superadminActor();
    const created = await service.createManual({ actor, userId: "user-1" });
    const revealed = await service.reveal({ actor, requestId: created.id });

    expect(created.source).toBe(PASSWORD_RESET_SOURCES.SUPPORT);
    expect(created.deliveryMode).toBe(PASSWORD_RESET_DELIVERY_MODES.MANUAL);
    expect(created.status).toBe(PASSWORD_RESET_STATUSES.MANUAL_READY);
    expect(revealed.url).toContain("native-token");
    expect(repository.records.get(created.id)?.manuallyRevealedAt).toBeInstanceOf(Date);
  });

  test("denies support actions without the assist capability", async () => {
    const { service } = setup();
    const actor = {
      ...superadminActor(),
      roleCode: ROLES.COO,
      accessProfileCode: ACCESS_PROFILE_CODES.OPERATIONS_FULL,
    };
    expect(service.createManual({ actor, userId: "user-1" })).rejects.toBeInstanceOf(
      AuthorizationError,
    );
  });

  test("does not reveal expired links but allows a new request", async () => {
    const { repository, service } = setup();
    repository.user = { id: "user-1", email: "known@example.com" };
    const actor = superadminActor();
    const expired = await service.createManual({ actor, userId: "user-1" });
    const oldRecord = repository.records.get(expired.id);
    if (oldRecord) oldRecord.expiresAt = new Date("2026-08-29T09:59:59.999Z");

    expect(service.reveal({ actor, requestId: expired.id })).rejects.toBeInstanceOf(
      PasswordResetConflictError,
    );
    const replacement = await service.createManual({ actor, userId: "user-1" });
    expect(replacement.id).not.toBe(expired.id);
    expect(repository.records.get(expired.id)?.status).toBe(PASSWORD_RESET_STATUSES.MANUAL_READY);
  });

  test("marks the exact request completed only after provider success", async () => {
    const { repository, service } = setup();
    repository.user = { id: "user-1", email: "known@example.com" };
    const actor = superadminActor();
    const request = await service.createManual({ actor, userId: "user-1" });
    await service.complete({
      requestId: request.id,
      token: "native-token",
      newPassword: "Strong1!",
    });

    expect(repository.records.get(request.id)?.status).toBe(PASSWORD_RESET_STATUSES.COMPLETED);
    expect(repository.records.get(request.id)?.completedAt).toBeInstanceOf(Date);
  });
});
