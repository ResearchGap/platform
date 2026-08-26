import type {
  AccountStatus,
  AuthorizationActor,
  RoleCode,
} from "../../authorization/authorization.types";

export const APPROVAL_STATUSES = {
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
} as const;

export type ApprovalStatus = (typeof APPROVAL_STATUSES)[keyof typeof APPROVAL_STATUSES];

export const APPROVAL_DECISIONS = {
  APPROVE: "APPROVE",
  REJECT: "REJECT",
} as const;

export type ApprovalDecision = (typeof APPROVAL_DECISIONS)[keyof typeof APPROVAL_DECISIONS];

export interface RegistrationCredentials {
  email: string;
  name: string;
  password: string;
}

export type PublicRegistration =
  | (RegistrationCredentials & { kind: "MENTEE" })
  | (RegistrationCredentials & { kind: "MENTOR" })
  | (RegistrationCredentials & { kind: "STAFF"; requestedRoleCode: "CEO" | "COO" | "CMO" });

export interface IdentitySignUpResult {
  cookies: readonly string[];
  user: {
    email: string;
    id: string;
    name: string;
  };
}

export interface IdentityProvider {
  deleteUser(userId: string): Promise<void>;
  signUp(credentials: RegistrationCredentials): Promise<IdentitySignUpResult>;
}

export interface RegistrationResult extends IdentitySignUpResult {
  access: {
    accountStatus: AccountStatus;
    roleCode: RoleCode;
  };
}

export interface ApprovalReviewResult {
  accountStatus: AccountStatus;
  approvalId: string;
  approvalStatus: ApprovalStatus;
  roleCode: RoleCode;
  userId: string;
}

export type { AuthorizationActor };
