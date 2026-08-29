import prisma from "@platform/db";

import type { PasswordResetRepository } from "../../modules/password-reset/password-reset.repository.js";
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
  async create(input: Parameters<PasswordResetRepository["create"]>[0]): Promise<void> {
    await prisma.passwordResetRequest.create({ data: input });
  }

  async attachUser(requestId: string, userId: string): Promise<void> {
    await prisma.passwordResetRequest.update({ where: { id: requestId }, data: { userId } });
  }

  async findUserByEmail(email: string) {
    return prisma.user.findFirst({
      where: { email: { equals: email, mode: "insensitive" } },
      select: { email: true, id: true },
    });
  }

  async findUserById(userId: string) {
    return prisma.user.findUnique({ where: { id: userId }, select: { email: true, id: true } });
  }

  async countRecent(input: Parameters<PasswordResetRepository["countRecent"]>[0]) {
    const [byEmail, byIp] = await Promise.all([
      prisma.passwordResetRequest.count({
        where: { requestedEmail: input.email, requestedAt: { gte: input.since } },
      }),
      input.ipAddress
        ? prisma.passwordResetRequest.count({
            where: { ipAddress: input.ipAddress, requestedAt: { gte: input.since } },
          })
        : Promise.resolve(0),
    ]);
    return { byEmail, byIp };
  }

  async findById(requestId: string): Promise<PasswordResetRecord | null> {
    return prisma.passwordResetRequest.findUnique({
      where: { id: requestId },
      select: resetRequestSelect,
    });
  }

  async listForUser(userId: string, limit: number): Promise<PasswordResetRecord[]> {
    return prisma.passwordResetRequest.findMany({
      where: { userId },
      orderBy: [{ requestedAt: "desc" }, { id: "desc" }],
      take: limit,
      select: resetRequestSelect,
    });
  }

  async recordIssued(input: Parameters<PasswordResetRepository["recordIssued"]>[0]): Promise<void> {
    await prisma.passwordResetRequest.update({
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
    safeDeliveryError?: string;
    status: PasswordResetStatus;
  }): Promise<void> {
    await prisma.passwordResetRequest.update({
      where: { id: input.requestId },
      data: {
        status: input.status,
        ...(input.emailSentAt ? { emailSentAt: input.emailSentAt } : {}),
        ...(input.safeDeliveryError ? { safeDeliveryError: input.safeDeliveryError } : {}),
      },
    });
  }

  async markCompleted(requestId: string, completedAt: Date): Promise<boolean> {
    const result = await prisma.passwordResetRequest.updateMany({
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
    const result = await prisma.passwordResetRequest.updateMany({
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
}
