export class InvalidPasswordResetError extends Error {
  constructor(message = "This password reset link is invalid or expired") {
    super(message);
    this.name = "InvalidPasswordResetError";
  }
}

export class PasswordResetNotFoundError extends Error {
  constructor() {
    super("Password reset request was not found");
    this.name = "PasswordResetNotFoundError";
  }
}

export class PasswordResetConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PasswordResetConflictError";
  }
}
