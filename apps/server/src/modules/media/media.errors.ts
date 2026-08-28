export class MediaNotFoundError extends Error {
  constructor() {
    super("Media asset was not found");
    this.name = "MediaNotFoundError";
  }
}

export class MediaValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaValidationError";
  }
}

export class MediaConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "MediaConflictError";
  }
}
