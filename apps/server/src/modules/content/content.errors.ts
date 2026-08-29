import type { ResearchContentStatus } from "./content.types.js";

export class ContentNotFoundError extends Error {
  constructor(message = "Research content was not found") {
    super(message);
    this.name = "ContentNotFoundError";
  }
}

export class ContentConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentConflictError";
  }
}

export class ContentLifecycleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ContentLifecycleError";
  }
}

export class InvalidContentTransitionError extends ContentLifecycleError {
  constructor(from: ResearchContentStatus, to: ResearchContentStatus) {
    super(`Research content cannot transition from ${from} to ${to}`);
    this.name = "InvalidContentTransitionError";
  }
}

export class ContentMediaNotFoundError extends Error {
  constructor() {
    super("The referenced cover media asset was not found");
    this.name = "ContentMediaNotFoundError";
  }
}
