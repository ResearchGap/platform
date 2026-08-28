import { randomUUID } from "node:crypto";

import { RESOURCE_SCOPES, RESOURCE_TYPES } from "../../authorization/access-profiles";
import { AuthorizationError, authorizeResource } from "../../authorization/authorize";
import type { AuthorizationActor } from "../../authorization/authorization.types";
import { PERMISSIONS } from "../../authorization/permissions";
import { MediaConflictError, MediaNotFoundError, MediaValidationError } from "./media.errors";
import type { FileStorage } from "./file-storage";
import type { MediaRepository } from "./media.repository";
import { MEDIA_SOURCE_TYPES, type MediaAssetDto, type MediaAssetRecord } from "./media.types";

export const MAX_MEDIA_BYTES = 5 * 1024 * 1024;
export const SUPPORTED_IMAGE_MIME_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/avif",
] as const;

function hasBytes(bytes: Uint8Array, offset: number, expected: readonly number[]): boolean {
  return expected.every((value, index) => bytes[offset + index] === value);
}

function hasAscii(bytes: Uint8Array, offset: number, expected: string): boolean {
  return expected.split("").every((value, index) => bytes[offset + index] === value.charCodeAt(0));
}

function matchesImageSignature(bytes: Uint8Array, mimeType: string): boolean {
  if (mimeType === "image/jpeg") return hasBytes(bytes, 0, [0xff, 0xd8, 0xff]);
  if (mimeType === "image/png")
    return hasBytes(bytes, 0, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]);
  if (mimeType === "image/webp") return hasAscii(bytes, 0, "RIFF") && hasAscii(bytes, 8, "WEBP");
  if (mimeType === "image/avif") {
    if (!hasAscii(bytes, 4, "ftyp")) return false;
    const lastBrandOffset = Math.min(bytes.byteLength - 4, 64);
    for (let offset = 8; offset <= lastBrandOffset; offset += 4) {
      if (hasAscii(bytes, offset, "avif") || hasAscii(bytes, offset, "avis")) return true;
    }
  }
  return false;
}

function safeOriginalName(value: string): string {
  const name = value.split(/[\\/]/).at(-1)?.trim() ?? "";
  if (!name || name.length > 255) {
    throw new MediaValidationError("Original filename must be between 1 and 255 characters");
  }
  return name;
}

export class MediaService {
  constructor(
    private readonly repository: MediaRepository,
    private readonly storage: FileStorage,
  ) {}

  async upload(
    actor: AuthorizationActor,
    input: { bytes: Uint8Array; mimeType: string; originalName: string },
  ): Promise<MediaAssetDto> {
    authorizeResource(actor, PERMISSIONS.MEDIA_UPLOAD, RESOURCE_TYPES.MEDIA);
    if (input.bytes.byteLength === 0 || input.bytes.byteLength > MAX_MEDIA_BYTES) {
      throw new MediaValidationError("Image must be between 1 byte and 5 MB");
    }
    if (!(SUPPORTED_IMAGE_MIME_TYPES as readonly string[]).includes(input.mimeType)) {
      throw new MediaValidationError("Only JPEG, PNG, WebP, and AVIF images are supported");
    }
    if (!matchesImageSignature(input.bytes, input.mimeType)) {
      throw new MediaValidationError("File contents do not match the declared image type");
    }

    const id = randomUUID();
    const originalName = safeOriginalName(input.originalName);
    const stored = await this.storage.upload({
      bytes: input.bytes,
      contentType: input.mimeType,
      mediaId: id,
    });
    try {
      const asset = await this.repository.createManaged({
        id,
        createdById: actor.userId,
        storageKey: stored.storageKey,
        originalName,
        mimeType: input.mimeType,
      });
      return this.toDto(asset);
    } catch (error) {
      await this.storage.delete(stored.storageKey).catch(() => undefined);
      throw error;
    }
  }

  async getById(id: string): Promise<MediaAssetDto> {
    const asset = await this.repository.findById(id);
    if (!asset) throw new MediaNotFoundError();
    return this.toDto(asset);
  }

  async delete(actor: AuthorizationActor, id: string): Promise<void> {
    const scope = authorizeResource(actor, PERMISSIONS.MEDIA_DELETE, RESOURCE_TYPES.MEDIA);
    const asset = await this.repository.findById(id);
    if (!asset) throw new MediaNotFoundError();
    if (asset.sourceType !== MEDIA_SOURCE_TYPES.MANAGED || !asset.storageKey) {
      throw new MediaConflictError("Only managed media can be deleted through this operation");
    }
    if (scope === RESOURCE_SCOPES.OWNED && asset.createdById !== actor.userId) {
      throw new AuthorizationError("You may only delete media that you uploaded");
    }
    if (scope !== RESOURCE_SCOPES.OWNED && scope !== RESOURCE_SCOPES.ALL) {
      throw new AuthorizationError("Media deletion scope is not configured");
    }

    const deleted = await this.repository.deleteIfUnreferenced(id);
    if (!deleted) {
      throw new MediaConflictError("Media is still referenced and cannot be deleted");
    }
    await this.storage.delete(asset.storageKey);
  }

  private toDto(asset: MediaAssetRecord): MediaAssetDto {
    const url =
      asset.sourceType === MEDIA_SOURCE_TYPES.MANAGED && asset.storageKey
        ? this.storage.resolvePublicUrl(asset.storageKey)
        : asset.externalUrl;
    if (!url) throw new MediaConflictError("Media asset does not have a resolvable URL");
    return {
      id: asset.id,
      sourceType: asset.sourceType,
      originalName: asset.originalName,
      mimeType: asset.mimeType,
      url,
      createdAt: asset.createdAt,
    };
  }
}
