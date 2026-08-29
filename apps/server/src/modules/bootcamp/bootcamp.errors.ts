import type { BootcampStatus } from "./bootcamp.types.js";

export class BootcampNotFoundError extends Error {
  constructor(message = "Bootcamp was not found") {
    super(message);
    this.name = "BootcampNotFoundError";
  }
}

export class BootcampSessionNotFoundError extends Error {
  constructor(message = "Bootcamp session was not found") {
    super(message);
    this.name = "BootcampSessionNotFoundError";
  }
}

export class BootcampConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BootcampConflictError";
  }
}

export class BootcampLifecycleError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BootcampLifecycleError";
  }
}

export class InvalidBootcampTransitionError extends BootcampLifecycleError {
  constructor(from: BootcampStatus, to: BootcampStatus) {
    super(`Bootcamp cannot transition from ${from} to ${to}`);
    this.name = "InvalidBootcampTransitionError";
  }
}

export class BootcampMediaNotFoundError extends Error {
  constructor() {
    super("The referenced cover media asset was not found");
    this.name = "BootcampMediaNotFoundError";
  }
}

export class BootcampDateRangeError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BootcampDateRangeError";
  }
}

export class BootcampSessionOrderError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BootcampSessionOrderError";
  }
}
