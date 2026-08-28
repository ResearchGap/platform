export const MEDIA_SOURCE_TYPES = {
  EXTERNAL: "EXTERNAL",
  MANAGED: "MANAGED",
} as const;

export type MediaSourceType = (typeof MEDIA_SOURCE_TYPES)[keyof typeof MEDIA_SOURCE_TYPES];

export interface MediaAssetRecord {
  createdAt: Date;
  createdById: string | null;
  externalUrl: string | null;
  id: string;
  mimeType: string | null;
  originalName: string | null;
  sourceType: MediaSourceType;
  storageKey: string | null;
}

export interface MediaAssetDto {
  createdAt: Date;
  id: string;
  mimeType: string | null;
  originalName: string | null;
  sourceType: MediaSourceType;
  url: string;
}
