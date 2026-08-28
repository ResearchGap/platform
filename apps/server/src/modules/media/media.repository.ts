import type { MediaAssetRecord } from "./media.types";

export interface MediaRepository {
  createManaged(input: {
    createdById: string;
    id: string;
    mimeType: string;
    originalName: string;
    storageKey: string;
  }): Promise<MediaAssetRecord>;
  deleteIfUnreferenced(id: string): Promise<boolean>;
  findById(id: string): Promise<MediaAssetRecord | null>;
}
