import { apiRequest } from "./client";

export interface MediaAssetDto {
  createdAt: string;
  id: string;
  mimeType: string | null;
  originalName: string | null;
  sourceType: "MANAGED" | "EXTERNAL";
  url: string;
}

export function uploadMedia(file: File): Promise<MediaAssetDto> {
  const body = new FormData();
  body.append("file", file);
  return apiRequest<MediaAssetDto>("/api/media", { method: "POST", body });
}

export function getMedia(mediaId: string): Promise<MediaAssetDto> {
  return apiRequest<MediaAssetDto>(`/api/media/${encodeURIComponent(mediaId)}`);
}

export function deleteMedia(mediaId: string): Promise<void> {
  return apiRequest<void>(`/api/media/${encodeURIComponent(mediaId)}`, { method: "DELETE" });
}
