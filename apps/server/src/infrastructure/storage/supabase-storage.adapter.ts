import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import {
  FileStorageError,
  type FileStorage,
  type StoredFile,
} from "../../modules/media/file-storage";

const EXTENSIONS: Readonly<Record<string, string>> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
};

export class SupabaseStorageAdapter implements FileStorage {
  private readonly client: SupabaseClient;

  constructor(private readonly config: { bucket: string; secretKey: string; url: string }) {
    this.client = createClient(config.url, config.secretKey, {
      auth: {
        autoRefreshToken: false,
        detectSessionInUrl: false,
        persistSession: false,
      },
    });
  }

  async upload(input: {
    bytes: Uint8Array;
    contentType: string;
    mediaId: string;
  }): Promise<StoredFile> {
    const extension = EXTENSIONS[input.contentType];
    if (!extension) throw new FileStorageError("Unsupported managed media type");
    const storageKey = `media/${input.mediaId}.${extension}`;
    const { error } = await this.client.storage
      .from(this.config.bucket)
      .upload(storageKey, input.bytes, {
        cacheControl: "31536000",
        contentType: input.contentType,
        upsert: false,
      });
    if (error) throw new FileStorageError("Managed media upload failed", { cause: error });
    return { storageKey };
  }

  async delete(storageKey: string): Promise<void> {
    const { error } = await this.client.storage.from(this.config.bucket).remove([storageKey]);
    if (error) throw new FileStorageError("Managed media deletion failed", { cause: error });
  }

  resolvePublicUrl(storageKey: string): string {
    return this.client.storage.from(this.config.bucket).getPublicUrl(storageKey).data.publicUrl;
  }
}
