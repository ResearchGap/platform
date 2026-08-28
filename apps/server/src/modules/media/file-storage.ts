export interface StoredFile {
  storageKey: string;
}

export class FileStorageError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "FileStorageError";
  }
}

export interface FileStorage {
  upload(input: { bytes: Uint8Array; contentType: string; mediaId: string }): Promise<StoredFile>;
  delete(storageKey: string): Promise<void>;
  resolvePublicUrl(storageKey: string): string;
}
