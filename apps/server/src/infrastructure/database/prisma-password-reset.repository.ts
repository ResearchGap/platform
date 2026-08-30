import { AsyncLocalStorage } from "node:async_hooks";

import prisma, { type Prisma } from "@platform/db";

import {
  PASSWORD_RESET_DELIVERY_IN_PROGRESS,
  type PasswordResetRepository,
} from "../../modules/password-reset/password-reset.repository.js";
import type {
  PasswordResetRecord,
  PasswordResetStatus,
} from "../../modules/password-reset/password-reset.types.js";

const resetRequestSelect = {
  completedAt: true,
  deliveryMode: true,
  emailSentAt: true,
  expiresAt: true,
  id: true,
  manuallyRevealedAt: true,
  requestedAt: true,
  requestedBy: { select: { id: true, name: true } },
  requestedEmail: true,
  resetUrlEncrypted: true,
  safeDeliveryError: true,
  source: true,
  status: true,
  userId: true,
} as const;

export class PrismaPasswordResetRepository implements PasswordResetRepository {
  private readonly transactionContext = new AsyncLocalStorage<Prisma.TransactionClient>();

  private get client(): Prisma.TransactionClient | typeof prisma {
    return this.transactionContext.getStore() ?? prisma;
  }

  async create(input: Parameters<PasswordResetRepository["create"]>[0]): Promise<void> {
    await this.client.passwordResetRequest.create({ data: input });
  }

  async attachUser(requestId: string, userId: string): Promise<void> {
    await this.client.passwordResetRequest.update({ where: { id: requestId }, data: { userId } });
  }

  async findUserByEmail(email: string) {
    return this.client.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: { email: true, id: true },
    });
  }

  async findUserById(userId: string) {
    return this.client.user.findUnique({
      where: { id: userId },
      select: { email: true, id: true },
    });
  }

  async countRecent(input: Parameters<PasswordResetRepository["countRecent"]>[0]) {
    const [byEmail, byIp] = await Promise.all([
      this.client.passwordResetRequest.count({
        where: { requestedEmail: input.email, requestedAt: { gte: input.since } },
      }),
      input.ipAddress
        ? this.client.passwordResetRequest.count({
            where: { ipAddress: input.ipAddress, requestedAt: { gte: input.since } },
          })
        : Promise.resolve(0),
    ]);
    return { byEmail, byIp };
  }

  async getEmailDeliveryState(
    input: Parameters<PasswordResetRepository["getEmailDeliveryState"]>[0],
  ) {
    const [latestSuccessful, successfulDeliveryCount, latestFailed, inFlight] = await Promise.all([
      this.client.passwordResetRequest.findFirst({
        where: { requestedEmail: input.email, emailSentAt: { not: null } },
        orderBy: { emailSentAt: "desc" },
        select: { emailSentAt: true },
      }),
      this.client.passwordResetRequest.count({
        where: {
          requestedEmail: input.email,
          emailSentAt: { gte: input.successfulSince },
        },
      }),
      this.client.passwordResetRequest.findFirst({
        where: {
          deliveryMode: "EMAIL",
          requestedEmail: input.email,
          status: "DELIVERY_FAILED",
          requestedAt: { gte: input.failureSince },
        },
        orderBy: { requestedAt: "desc" },
        select: { requestedAt: true },
      }),
      this.client.passwordResetRequest.findFirst({
        where: {
          id: { not: input.excludeRequestId },
          deliveryMode: "EMAIL",
          requestedEmail: input.email,
          requestedAt: { gte: input.inFlightSince },
          safeDeliveryError: PASSWORD_RESET_DELIVERY_IN_PROGRESS,
          status: "REQUESTED",
        },
        select: { id: true },
      }),
    ]);

    return {
      hasInFlightDelivery: inFlight !== null,
      latestFailedRequestAt: latestFailed?.requestedAt ?? null,
      latestSuccessfulEmailSentAt: latestSuccessful?.emailSentAt ?? null,
      successfulDeliveryCount,
    };
  }

  async findById(requestId: string): Promise<PasswordResetRecord | null> {
    return this.client.passwordResetRequest.findUnique({
      where: { id: requestId },
      select: resetRequestSelect,
    });
  }

  async listForUser(userId: string, limit: number): Promise<PasswordResetRecord[]> {
    return this.client.passwordResetRequest.findMany({
      where: { userId },
      orderBy: [{ requestedAt: "desc" }, { id: "desc" }],
      take: limit,
      select: resetRequestSelect,
    });
  }

  async recordIssued(input: Parameters<PasswordResetRepository["recordIssued"]>[0]): Promise<void> {
    await this.client.passwordResetRequest.update({
      where: { id: input.requestId },
      data: {
        expiresAt: input.expiresAt,
        resetUrlEncrypted: input.resetUrlEncrypted,
      },
    });
  }

  async updateStatus(input: {
    emailSentAt?: Date;
    requestId: string;
    safeDeliveryError?: string | null;
    status: PasswordResetStatus;
  }): Promise<void> {
    await this.client.passwordResetRequest.update({
      where: { id: input.requestId },
      data: {
        status: input.status,
        ...(input.emailSentAt ? { emailSentAt: input.emailSentAt } : {}),
        ...(input.safeDeliveryError !== undefined
          ? { safeDeliveryError: input.safeDeliveryError }
          : {}),
      },
    });
  }

  async markCompleted(requestId: string, completedAt: Date): Promise<boolean> {
    const result = await this.client.passwordResetRequest.updateMany({
      where: {
        id: requestId,
        status: { not: "COMPLETED" },
        expiresAt: { gt: completedAt },
      },
      data: { completedAt, status: "COMPLETED" },
    });
    return result.count === 1;
  }

  async markManuallyRevealed(
    input: Parameters<PasswordResetRepository["markManuallyRevealed"]>[0],
  ): Promise<boolean> {
    const result = await this.client.passwordResetRequest.updateMany({
      where: {
        id: input.requestId,
        status: { not: "COMPLETED" },
        expiresAt: { gt: input.revealedAt },
        resetUrlEncrypted: { not: null },
        userId: { not: null },
      },
      data: {
        manuallyRevealedAt: input.revealedAt,
        manuallyRevealedById: input.actorId,
      },
    });
    return result.count === 1;
  }

  async withEmailDeliveryLock<T>(email: string, operation: () => Promise<T>): Promise<T> {
    return prisma.$transaction(
      async (transaction) => {
        await transaction.$queryRaw`SELECT pg_advisory_xact_lock(hashtextextended(${email}, 0))`;
        return this.transactionContext.run(transaction, operation);
      },
      { maxWait: 10_000, timeout: 10_000 },
    );
  }
}
