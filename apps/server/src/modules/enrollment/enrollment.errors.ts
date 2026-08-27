export class EnrollmentNotFoundError extends Error {
  constructor(message = "Enrollment resource was not found") {
    super(message);
    this.name = "EnrollmentNotFoundError";
  }
}

export class EnrollmentKeyInvalidError extends Error {
  constructor(message = "Enrollment key is invalid") {
    super(message);
    this.name = "EnrollmentKeyInvalidError";
  }
}

export class EnrollmentKeyUnavailableError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnrollmentKeyUnavailableError";
  }
}

export class BootcampNotEnrollableError extends Error {
  constructor(message = "Bootcamp is not currently open for enrollment") {
    super(message);
    this.name = "BootcampNotEnrollableError";
  }
}

export class EnrollmentConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnrollmentConflictError";
  }
}

export class EnrollmentEligibilityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "EnrollmentEligibilityError";
  }
}
