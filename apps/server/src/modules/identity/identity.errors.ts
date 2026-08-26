export class IdentityNotFoundError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "IdentityNotFoundError";
  }
}

export class InvalidApprovalTransitionError extends Error {
  constructor() {
    super("Only pending approval requests can be reviewed");
    this.name = "InvalidApprovalTransitionError";
  }
}

export class RegistrationConsistencyError extends Error {
  constructor(cause: unknown) {
    super("Registration could not be completed consistently", { cause });
    this.name = "RegistrationConsistencyError";
  }
}
