import prisma from "@platform/db";

import { ContentConflictError, ContentNotFoundError } from "../../modules/content/content.errors";
import type { ResearchContentRepository } from "../../modules/content/content.repository";
import {
  RESEARCH_CONTENT_STATUSES,
  type ContentListInput,
  type ContentPage,
  type ContentPerson,
  type CreateResearchContentInput,
  type ResearchContentDetail,
  type ResearchContentStatus,
  type ResearchContentSummary,
  type ResearchContentType,
  type UpdateResearchContentInput,
} from "../../modules/content/content.types";

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
  excerpt: true,
  contentType: true,
  coverAssetId: true,
  status: true,
  authorId: true,
  publishedById: true,
  publishedAt: true,
  createdAt: true,
  updatedAt: true,
  author: { select: personSelect },
  publishedBy: { select: personSelect },
  coverAsset: { select: coverSelect },
} as const;
const detailSelect = { ...summarySelect, content: true } as const;

interface PersistedContentSummary {
  author: ContentPerson;
  authorId: string;
  coverAsset: {
    externalUrl: string | null;
    id: string;
    mimeType: string | null;
    originalName: string | null;
  } | null;
  coverAssetId: string | null;
  createdAt: Date;
  excerpt: string | null;
  id: string;
  contentType: ResearchContentType;
  publishedAt: Date | null;
  publishedBy: ContentPerson | null;
  publishedById: string | null;
  slug: string;
  status: ResearchContentStatus;
  title: string;
  updatedAt: Date;
}

interface PersistedContentDetail extends PersistedContentSummary {
  content: string;
}

function toSummary(record: PersistedContentSummary): ResearchContentSummary {
  return {
    id: record.id,
    title: record.title,
    slug: record.slug,
    excerpt: record.excerpt,
    type: record.contentType,
    coverAssetId: record.coverAssetId,
    cover: record.coverAsset,
    status: record.status,
    authorId: record.authorId,
    author: record.author,
    publishedById: record.publishedById,
    publishedBy: record.publishedBy,
    publishedAt: record.publishedAt,
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
  };
}

function toDetail(record: PersistedContentDetail): ResearchContentDetail {
  return { ...toSummary(record), content: record.content };
}

function toPage<T extends { id: string }, R>(
  records: T[],
  limit: number,
  map: (record: T) => R,
): ContentPage<R> {
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

export class PrismaResearchContentRepository implements ResearchContentRepository {
  async coverAssetExists(id: string): Promise<boolean> {
    return (await prisma.mediaAsset.count({ where: { id } })) === 1;
  }

  async create(
    input: CreateResearchContentInput & { authorId: string },
  ): Promise<ResearchContentDetail> {
    try {
      const record = await prisma.researchContent.create({
        data: {
          title: input.title,
          slug: input.slug,
          excerpt: input.excerpt,
          content: input.content,
          contentType: input.type,
          coverAssetId: input.coverAssetId,
          authorId: input.authorId,
        },
        select: detailSelect,
      });
      return toDetail(record);
    } catch (error) {
      if (hasPrismaCode(error, "P2002")) {
        throw new ContentConflictError("Research content slug is already in use");
      }
      throw error;
    }
  }

  async findById(id: string): Promise<ResearchContentDetail | null> {
    const record = await prisma.researchContent.findUnique({
      where: { id },
      select: detailSelect,
    });
    return record ? toDetail(record) : null;
  }

  async findBySlug(slug: string): Promise<ResearchContentDetail | null> {
    const record = await prisma.researchContent.findUnique({
      where: { slug },
      select: detailSelect,
    });
    return record ? toDetail(record) : null;
  }

  async findPublishedBySlug(slug: string): Promise<ResearchContentDetail | null> {
    const record = await prisma.researchContent.findFirst({
      where: {
        slug,
        status: RESEARCH_CONTENT_STATUSES.PUBLISHED,
        publishedAt: { lte: new Date() },
      },
      select: detailSelect,
    });
    return record ? toDetail(record) : null;
  }

  async list(
    input: ContentListInput & { authorId?: string },
  ): Promise<ContentPage<ResearchContentSummary>> {
    const records = await prisma.researchContent.findMany({
      where: {
        ...(input.authorId ? { authorId: input.authorId } : {}),
        ...(input.status ? { status: input.status } : {}),
        ...(input.type ? { contentType: input.type } : {}),
      },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      select: summarySelect,
    });
    return toPage(records, input.limit, toSummary);
  }

  async listPublished(
    input: Omit<ContentListInput, "status">,
  ): Promise<ContentPage<ResearchContentSummary>> {
    const records = await prisma.researchContent.findMany({
      where: {
        status: RESEARCH_CONTENT_STATUSES.PUBLISHED,
        publishedAt: { lte: new Date() },
        ...(input.type ? { contentType: input.type } : {}),
      },
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      take: input.limit + 1,
      ...(input.cursor ? { cursor: { id: input.cursor }, skip: 1 } : {}),
      select: summarySelect,
    });
    return toPage(records, input.limit, toSummary);
  }

  async transitionStatus(input: {
    expectedStatus: ResearchContentStatus;
    id: string;
    publishedAt?: Date;
    publishedById?: string;
    status: ResearchContentStatus;
  }): Promise<ResearchContentDetail | null> {
    const result = await prisma.researchContent.updateMany({
      where: { id: input.id, status: input.expectedStatus },
      data: {
        status: input.status,
        ...(input.publishedAt ? { publishedAt: input.publishedAt } : {}),
        ...(input.publishedById ? { publishedById: input.publishedById } : {}),
      },
    });
    return result.count === 1 ? this.findById(input.id) : null;
  }

  async update(id: string, input: UpdateResearchContentInput): Promise<ResearchContentDetail> {
    try {
      const record = await prisma.researchContent.update({
        where: { id },
        data: {
          ...(input.title !== undefined ? { title: input.title } : {}),
          ...(input.slug !== undefined ? { slug: input.slug } : {}),
          ...(input.excerpt !== undefined ? { excerpt: input.excerpt } : {}),
          ...(input.content !== undefined ? { content: input.content } : {}),
          ...(input.type !== undefined ? { contentType: input.type } : {}),
          ...(input.coverAssetId !== undefined ? { coverAssetId: input.coverAssetId } : {}),
        },
        select: detailSelect,
      });
      return toDetail(record);
    } catch (error) {
      if (hasPrismaCode(error, "P2002")) {
        throw new ContentConflictError("Research content slug is already in use");
      }
      if (hasPrismaCode(error, "P2025")) {
        throw new ContentNotFoundError();
      }
      throw error;
    }
  }
}
