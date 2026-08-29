import type { WebinarStatus } from "./webinar.types.js";

export class WebinarNotFoundError extends Error {
  constructor(message = "Webinar was not found") {
    super(message);
    this.name = "WebinarNotFoundError";
  }
}

export class WebinarConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebinarConflictError";
  }
}

export class WebinarLifecycleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "WebinarLifecycleError";
  }
}

export class InvalidWebinarTransitionError extends WebinarLifecycleError {
  constructor(from: WebinarStatus, to: WebinarStatus) {
    super(`Webinar cannot transition from ${from} to ${to}`);
    this.name = "InvalidWebinarTransitionError";
  }
}

export class WebinarMediaNotFoundError extends Error {
  constructor() {
    super("The referenced cover media asset was not found");
    this.name = "WebinarMediaNotFoundError";
  }
}
