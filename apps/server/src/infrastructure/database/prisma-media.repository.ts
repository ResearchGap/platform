import prisma from "@platform/db";

import type { MediaRepository } from "../../modules/media/media.repository.js";
import type { MediaAssetRecord } from "../../modules/media/media.types.js";

const mediaSelect = {
  id: true,
  createdById: true,
  sourceType: true,
  storageKey: true,
  externalUrl: true,
  originalName: true,
  mimeType: true,
  createdAt: true,
} as const;

export class PrismaMediaRepository implements MediaRepository {
  async createManaged(input: {
    createdById: string;
    id: string;
    mimeType: string;
    originalName: string;
    storageKey: string;
  }): Promise<MediaAssetRecord> {
    return prisma.mediaAsset.create({
      data: {
        ...input,
        sourceType: "MANAGED",
      },
      select: mediaSelect,
    });
  }

  async findById(id: string): Promise<MediaAssetRecord | null> {
    return prisma.mediaAsset.findUnique({ where: { id }, select: mediaSelect });
  }

  async deleteIfUnreferenced(id: string): Promise<boolean> {
    const result = await prisma.mediaAsset.deleteMany({
      where: {
        id,
        contentCoverFor: { none: {} },
        webinarCoverFor: { none: {} },
        bootcampCoverFor: { none: {} },
        sessionCoverFor: { none: {} },
      },
    });
    return result.count === 1;
  }
}
