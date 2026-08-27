import prisma from "@platform/db";

import {
  BootcampConflictError,
  BootcampNotFoundError,
  BootcampSessionNotFoundError,
  BootcampSessionOrderError,
} from "../../modules/bootcamp/bootcamp.errors";
import type { BootcampRepository } from "../../modules/bootcamp/bootcamp.repository";
import {
  BOOTCAMP_STATUSES,
  BOOTCAMP_TIMINGS,
  type BootcampDetail,
  type BootcampListInput,
  type BootcampPage,
  type BootcampPerson,
  type BootcampSessionDetail,
  type BootcampSessionType,
  type BootcampStatus,
  type BootcampSummary,
  type CreateBootcampInput,
  type CreateBootcampSessionInput,
  type UpdateBootcampInput,
  type UpdateBootcampSessionInput,
} from "../../modules/bootcamp/bootcamp.types";

const personSelect = { id: true, name: true } as const;
const coverSelect = {
  id: true,
  externalUrl: true,
  mimeType: true,
  originalName: true,
} as const;
const bootcampSummarySelect = {
  id: true,
  title: true,
  slug: true,
  whatYouGet: true,
  startDate: true,
  endDate: true,
  registrationDeadline: true,
  coverAssetId: true,
  status: true,
  createdById: true,
  publishedById: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  createdBy: { select: personSelect },
  publishedBy: { select: personSelect },
  coverAsset: { select: coverSelect },
} as const;
const bootcampDetailSelect = { ...bootcampSummarySelect, description: true } as const;
const sessionSelect = {
  id: true,
  bootcampId: true,
  title: true,
  description: true,
  speakerName: true,
  scheduledAt: true,
  sessionType: true,
  venue: true,
  moduleUrl: true,
  preTestUrl: true,
  postTestUrl: true,
  feedbackUrl: true,
  recordingUrl: true,
  coverAssetId: true,
  sortOrder: true,
  createdAt: true,
  updatedAt: true,
  coverAsset: { select: coverSelect },
} as const;

interface PersistedBootcampSummary {
  coverAsset: BootcampSummary["cover"];
  coverAssetId: string | null;
  createdAt: Date;
  createdBy: BootcampPerson;
  createdById: string;
  endDate: Date;
  id: string;
  publishedAt: Date | null;
  publishedBy: BootcampPerson | null;
  publishedById: string | null;
  registrationDeadline: Date | null;
  slug: string;
  startDate: Date;
  status: BootcampStatus;
  title: string;
  updatedAt: Date;
  whatYouGet: string | null;
}

interface PersistedBootcampDetail extends PersistedBootcampSummary {
  description: string;
}

interface PersistedBootcampSession {
  bootcampId: string;
  coverAsset: BootcampSessionDetail["cover"];
  coverAssetId: string | null;
  createdAt: Date;
  description: string | null;
  feedbackUrl: string | null;
  id: string;
  moduleUrl: string | null;
  postTestUrl: string | null;
  preTestUrl: string | null;
  recordingUrl: string | null;
  scheduledAt: Date;
  sessionType: BootcampSessionType;
  sortOrder: number;
  speakerName: string | null;
  title: string;
  updatedAt: Date;
  venue: string | null;
}

function toSummary(record: PersistedBootcampSummary): BootcampSummary {
  return {
    id: record.id,
    title: record.title,
    slug: record.slug,
    whatYouGet: record.whatYouGet,
    startDate: record.startDate,
    endDate: record.endDate,
    registrationDeadline: record.registrationDeadline,
    coverAssetId: record.coverAssetId,
    cover: record.coverAsset,
    status: record.status,
    createdById: record.createdById,
    createdBy: record.createdBy,
    publishedById: record.publishedById,
    publishedBy: record.publishedBy,
    publishedAt: record.publishedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function toDetail(record: PersistedBootcampDetail): BootcampDetail {
  return { ...toSummary(record), description: record.description };
}

function toSession(record: PersistedBootcampSession): BootcampSessionDetail {
  return {
    id: record.id,
    bootcampId: record.bootcampId,
    title: record.title,
    description: record.description,
    speakerName: record.speakerName,
    scheduledAt: record.scheduledAt,
    sessionType: record.sessionType,
    venue: record.venue,
    moduleUrl: record.moduleUrl,
    preTestUrl: record.preTestUrl,
    postTestUrl: record.postTestUrl,
    feedbackUrl: record.feedbackUrl,
    recordingUrl: record.recordingUrl,
    coverAssetId: record.coverAssetId,
    cover: record.coverAsset,
    sortOrder: record.sortOrder,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function toPage<T extends { id: string }, R>(
  records: T[],
  limit: number,
  map: (record: T) => R,
): BootcampPage<R> {
  const hasNextPage = records.length > limit;
  const pageRecords = hasNextPage ? records.slice(0, limit) : records;
  return {
    items: pageRecords.map(map),
    nextCursor: hasNextPage ? (pageRecords.at(-1)?.id ?? null) : null,
  };
}

function hasPrismaCode(error: unknown, code: string): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code?: unknown }).code === code
  );
}

function timingFilter(input: Pick<BootcampListInput, "timing">, now: Date) {
  if (input.timing === BOOTCAMP_TIMINGS.UPCOMING) {
    return { startDate: { gt: now } };
  }
  if (input.timing === BOOTCAMP_TIMINGS.ONGOING) {
    return { startDate: { lte: now }, endDate: { gte: now } };
  }
  if (input.timing === BOOTCAMP_TIMINGS.COMPLETED) {
    return { endDate: { lt: now } };
  }
  return {};
}

export class PrismaBootcampRepository implements BootcampRepository {
  async coverAssetExists(id: string): Promise<boolean> {
    return (await prisma.mediaAsset.count({ where: { id } })) === 1;
  }

  async create(input: CreateBootcampInput & { createdById: string }): Promise<BootcampDetail> {
    try {
      const record = await prisma.bootcamp.create({
        data: {
          title: input.title,
          slug: input.slug,
          description: input.description,
          whatYouGet: input.whatYouGet,
          startDate: input.startDate,
          endDate: input.endDate,
          registrationDeadline: input.registrationDeadline,
          coverAssetId: input.coverAssetId,
          createdById: input.createdById,
        },
        select: bootcampDetailSelect,
      });
      return toDetail(record);
    } catch (error) {
      if (hasPrismaCode(error, "P2002")) {
        throw new BootcampConflictError("Bootcamp slug is already in use");
      }
      throw error;
    }
  }

  async findById(id: string): Promise<BootcampDetail | null> {
    const record = await prisma.bootcamp.findUnique({
      where: { id },
      select: bootcampDetailSelect,
    });
    return record ? toDetail(record) : null;
  }

  async findBySlug(slug: string): Promise<BootcampDetail | null> {
    const record = await prisma.bootcamp.findUnique({
      where: { slug },
      select: bootcampDetailSelect,
    });
    return record ? toDetail(record) : null;
  }

  async findPublicBySlug(slug: string): Promise<BootcampDetail | null> {
    const record = await prisma.bootcamp.findFirst({
      where: {
        slug,
        status: { in: [BOOTCAMP_STATUSES.PUBLISHED, BOOTCAMP_STATUSES.COMPLETED] },
        publishedAt: { lte: new Date() },
      },
      select: bootcampDetailSelect,
    });
    return record ? toDetail(record) : null;
  }

  async list(
    input: BootcampListInput & { createdById?: string },
  ): Promise<BootcampPage<BootcampSummary>> {
    const records = await prisma.bootcamp.findMany({
      where: {
        ...(input.createdById ? { createdById: input.createdById } : {}),
        ...(input.status ? { status: input.status } : {}),
        ...timingFilter(input, new Date()),
      },
      orderBy: [{ startDate: "desc" }, { id: "desc" }],
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      select: bootcampSummarySelect,
    });
    return toPage(records, input.limit, toSummary);
  }

  async listPublic(
    input: Omit<BootcampListInput, "status">,
  ): Promise<BootcampPage<BootcampSummary>> {
    const records = await prisma.bootcamp.findMany({
      where: {
        status: { in: [BOOTCAMP_STATUSES.PUBLISHED, BOOTCAMP_STATUSES.COMPLETED] },
        publishedAt: { lte: new Date() },
        ...timingFilter(input, new Date()),
      },
      orderBy: [
        { startDate: input.timing === BOOTCAMP_TIMINGS.UPCOMING ? "asc" : "desc" },
        { id: "desc" },
      ],
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      select: bootcampSummarySelect,
    });
    return toPage(records, input.limit, toSummary);
  }

  async update(id: string, input: UpdateBootcampInput): Promise<BootcampDetail> {
    try {
      const record = await prisma.bootcamp.update({
        where: { id },
        data: {
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(input.slug !== undefined ? { slug: input.slug } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.whatYouGet !== undefined ? { whatYouGet: input.whatYouGet } : {}),
          ...(input.startDate !== undefined ? { startDate: input.startDate } : {}),
          ...(input.endDate !== undefined ? { endDate: input.endDate } : {}),
          ...(input.registrationDeadline !== undefined
            ? { registrationDeadline: input.registrationDeadline }
            : {}),
          ...(input.coverAssetId !== undefined ? { coverAssetId: input.coverAssetId } : {}),
        },
        select: bootcampDetailSelect,
      });
      return toDetail(record);
    } catch (error) {
      if (hasPrismaCode(error, "P2002")) {
        throw new BootcampConflictError("Bootcamp slug is already in use");
      }
      if (hasPrismaCode(error, "P2025")) {
        throw new BootcampNotFoundError();
      }
      throw error;
    }
  }

  async transitionStatus(input: {
    expectedStatus: BootcampStatus;
    id: string;
    publishedAt?: Date;
    publishedById?: string;
    status: BootcampStatus;
  }): Promise<BootcampDetail | null> {
    const result = await prisma.bootcamp.updateMany({
      where: { id: input.id, status: input.expectedStatus },
      data: {
        status: input.status,
        ...(input.publishedAt ? { publishedAt: input.publishedAt } : {}),
        ...(input.publishedById ? { publishedById: input.publishedById } : {}),
      },
    });
    return result.count === 1 ? this.findById(input.id) : null;
  }

  async createSession(
    bootcampId: string,
    input: CreateBootcampSessionInput,
  ): Promise<BootcampSessionDetail> {
    try {
      const record = await prisma.bootcampSession.create({
        data: { bootcampId, ...input },
        select: sessionSelect,
      });
      return toSession(record);
    } catch (error) {
      if (hasPrismaCode(error, "P2002")) {
        throw new BootcampSessionOrderError("Session sort order is already in use");
      }
      throw error;
    }
  }

  async findSession(bootcampId: string, sessionId: string): Promise<BootcampSessionDetail | null> {
    const record = await prisma.bootcampSession.findFirst({
      where: { id: sessionId, bootcampId },
      select: sessionSelect,
    });
    return record ? toSession(record) : null;
  }

  async listSessions(bootcampId: string): Promise<BootcampSessionDetail[]> {
    const records = await prisma.bootcampSession.findMany({
      where: { bootcampId },
      orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
      select: sessionSelect,
    });
    return records.map(toSession);
  }

  async updateSession(
    bootcampId: string,
    sessionId: string,
    input: UpdateBootcampSessionInput,
  ): Promise<BootcampSessionDetail> {
    try {
      const existing = await this.findSession(bootcampId, sessionId);
      if (!existing) {
        throw new BootcampSessionNotFoundError();
      }
      const record = await prisma.bootcampSession.update({
        where: { id: sessionId },
        data: input,
        select: sessionSelect,
      });
      return toSession(record);
    } catch (error) {
      if (hasPrismaCode(error, "P2002")) {
        throw new BootcampSessionOrderError("Session sort order is already in use");
      }
      if (hasPrismaCode(error, "P2025")) {
        throw new BootcampSessionNotFoundError();
      }
      throw error;
    }
  }

  async reorderSessions(
    bootcampId: string,
    sessionIds: string[],
  ): Promise<BootcampSessionDetail[]> {
    try {
      return await prisma.$transaction(async (transaction) => {
        for (const [index, sessionId] of sessionIds.entries()) {
          await transaction.bootcampSession.update({
            where: { id: sessionId },
            data: { sortOrder: -(index + 1) },
          });
        }
        for (const [index, sessionId] of sessionIds.entries()) {
          await transaction.bootcampSession.update({
            where: { id: sessionId },
            data: { sortOrder: index },
          });
        }
        const records = await transaction.bootcampSession.findMany({
          where: { bootcampId },
          orderBy: [{ sortOrder: "asc" }, { id: "asc" }],
          select: sessionSelect,
        });
        return records.map(toSession);
      });
    } catch (error) {
      if (hasPrismaCode(error, "P2002")) {
        throw new BootcampSessionOrderError("Session order could not be updated");
      }
      throw error;
    }
  }

  async deleteSession(bootcampId: string, sessionId: string): Promise<boolean> {
    const result = await prisma.bootcampSession.deleteMany({
      where: { id: sessionId, bootcampId },
    });
    return result.count === 1;
  }
}
