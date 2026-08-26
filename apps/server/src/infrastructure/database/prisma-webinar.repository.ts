import prisma from "@platform/db";

import { WebinarConflictError, WebinarNotFoundError } from "../../modules/webinar/webinar.errors";
import type { WebinarRepository } from "../../modules/webinar/webinar.repository";
import {
  WEBINAR_STATUSES,
  WEBINAR_TIMINGS,
  type CreateWebinarInput,
  type UpdateWebinarInput,
  type WebinarDetail,
  type WebinarListInput,
  type WebinarPage,
  type WebinarPerson,
  type WebinarSessionType,
  type WebinarStatus,
  type WebinarSummary,
} from "../../modules/webinar/webinar.types";

const personSelect = { id: true, name: true } as const;
const coverSelect = {
  id: true,
  externalUrl: true,
  mimeType: true,
  originalName: true,
} as const;
const summarySelect = {
  id: true,
  title: true,
  slug: true,
  speakerName: true,
  scheduledAt: true,
  sessionType: true,
  venue: true,
  registrationUrl: true,
  meetingUrl: true,
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
const detailSelect = { ...summarySelect, description: true } as const;

interface PersistedWebinarSummary {
  coverAsset: {
    externalUrl: string | null;
    id: string;
    mimeType: string | null;
    originalName: string | null;
  } | null;
  coverAssetId: string | null;
  createdAt: Date;
  createdBy: WebinarPerson;
  createdById: string;
  id: string;
  meetingUrl: string | null;
  publishedAt: Date | null;
  publishedBy: WebinarPerson | null;
  publishedById: string | null;
  registrationUrl: string | null;
  scheduledAt: Date;
  sessionType: WebinarSessionType;
  slug: string;
  speakerName: string | null;
  status: WebinarStatus;
  title: string;
  updatedAt: Date;
  venue: string | null;
}

interface PersistedWebinarDetail extends PersistedWebinarSummary {
  description: string;
}

function toSummary(record: PersistedWebinarSummary): WebinarSummary {
  return {
    id: record.id,
    title: record.title,
    slug: record.slug,
    speakerName: record.speakerName,
    scheduledAt: record.scheduledAt,
    sessionType: record.sessionType,
    venue: record.venue,
    registrationUrl: record.registrationUrl,
    meetingUrl: record.meetingUrl,
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

function toDetail(record: PersistedWebinarDetail): WebinarDetail {
  return { ...toSummary(record), description: record.description };
}

function toPage<T extends { id: string }, R>(
  records: T[],
  limit: number,
  map: (record: T) => R,
): WebinarPage<R> {
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

function timingFilter(input: Pick<WebinarListInput, "timing">, now: Date) {
  if (input.timing === WEBINAR_TIMINGS.UPCOMING) {
    return { scheduledAt: { gte: now } };
  }
  if (input.timing === WEBINAR_TIMINGS.PAST) {
    return { scheduledAt: { lt: now } };
  }
  return {};
}

export class PrismaWebinarRepository implements WebinarRepository {
  async coverAssetExists(id: string): Promise<boolean> {
    return (await prisma.mediaAsset.count({ where: { id } })) === 1;
  }

  async create(input: CreateWebinarInput & { createdById: string }): Promise<WebinarDetail> {
    try {
      const record = await prisma.webinar.create({
        data: {
          title: input.title,
          slug: input.slug,
          description: input.description,
          speakerName: input.speakerName,
          scheduledAt: input.scheduledAt,
          sessionType: input.sessionType,
          venue: input.venue,
          registrationUrl: input.registrationUrl,
          meetingUrl: input.meetingUrl,
          coverAssetId: input.coverAssetId,
          createdById: input.createdById,
        },
        select: detailSelect,
      });
      return toDetail(record);
    } catch (error) {
      if (hasPrismaCode(error, "P2002")) {
        throw new WebinarConflictError("Webinar slug is already in use");
      }
      throw error;
    }
  }

  async findById(id: string): Promise<WebinarDetail | null> {
    const record = await prisma.webinar.findUnique({ where: { id }, select: detailSelect });
    return record ? toDetail(record) : null;
  }

  async findBySlug(slug: string): Promise<WebinarDetail | null> {
    const record = await prisma.webinar.findUnique({ where: { slug }, select: detailSelect });
    return record ? toDetail(record) : null;
  }

  async findPublicBySlug(slug: string): Promise<WebinarDetail | null> {
    const record = await prisma.webinar.findFirst({
      where: {
        slug,
        status: { in: [WEBINAR_STATUSES.PUBLISHED, WEBINAR_STATUSES.COMPLETED] },
        publishedAt: { lte: new Date() },
      },
      select: detailSelect,
    });
    return record ? toDetail(record) : null;
  }

  async list(
    input: WebinarListInput & { createdById?: string },
  ): Promise<WebinarPage<WebinarSummary>> {
    const records = await prisma.webinar.findMany({
      where: {
        ...(input.createdById ? { createdById: input.createdById } : {}),
        ...(input.status ? { status: input.status } : {}),
        ...timingFilter(input, new Date()),
      },
      orderBy: [{ scheduledAt: "desc" }, { id: "desc" }],
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      select: summarySelect,
    });
    return toPage(records, input.limit, toSummary);
  }

  async listPublic(input: Omit<WebinarListInput, "status">): Promise<WebinarPage<WebinarSummary>> {
    const records = await prisma.webinar.findMany({
      where: {
        status: { in: [WEBINAR_STATUSES.PUBLISHED, WEBINAR_STATUSES.COMPLETED] },
        publishedAt: { lte: new Date() },
        ...timingFilter(input, new Date()),
      },
      orderBy: [
        { scheduledAt: input.timing === WEBINAR_TIMINGS.UPCOMING ? "asc" : "desc" },
        { id: "desc" },
      ],
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      select: summarySelect,
    });
    return toPage(records, input.limit, toSummary);
  }

  async transitionStatus(input: {
    expectedStatus: WebinarStatus;
    id: string;
    publishedAt?: Date;
    publishedById?: string;
    status: WebinarStatus;
  }): Promise<WebinarDetail | null> {
    const result = await prisma.webinar.updateMany({
      where: { id: input.id, status: input.expectedStatus },
      data: {
        status: input.status,
        ...(input.publishedAt ? { publishedAt: input.publishedAt } : {}),
        ...(input.publishedById ? { publishedById: input.publishedById } : {}),
      },
    });
    return result.count === 1 ? this.findById(input.id) : null;
  }

  async update(id: string, input: UpdateWebinarInput): Promise<WebinarDetail> {
    try {
      const record = await prisma.webinar.update({
        where: { id },
        data: {
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(input.slug !== undefined ? { slug: input.slug } : {}),
          ...(input.description !== undefined ? { description: input.description } : {}),
          ...(input.speakerName !== undefined ? { speakerName: input.speakerName } : {}),
          ...(input.scheduledAt !== undefined ? { scheduledAt: input.scheduledAt } : {}),
          ...(input.sessionType !== undefined ? { sessionType: input.sessionType } : {}),
          ...(input.venue !== undefined ? { venue: input.venue } : {}),
          ...(input.registrationUrl !== undefined
            ? { registrationUrl: input.registrationUrl }
            : {}),
          ...(input.meetingUrl !== undefined ? { meetingUrl: input.meetingUrl } : {}),
          ...(input.coverAssetId !== undefined ? { coverAssetId: input.coverAssetId } : {}),
        },
        select: detailSelect,
      });
      return toDetail(record);
    } catch (error) {
      if (hasPrismaCode(error, "P2002")) {
        throw new WebinarConflictError("Webinar slug is already in use");
      }
      if (hasPrismaCode(error, "P2025")) {
        throw new WebinarNotFoundError();
      }
      throw error;
    }
  }
}
