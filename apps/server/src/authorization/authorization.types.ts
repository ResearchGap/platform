export const ROLES = {
  MENTEE: "MENTEE",
  MENTOR: "MENTOR",
  CEO: "CEO",
  COO: "COO",
  CMO: "CMO",
  SUPERADMIN: "SUPERADMIN",
} as const;

export type RoleCode = (typeof ROLES)[keyof typeof ROLES];

export const ACCESS_PROFILE_CODES = {
  MENTEE_DEFAULT: "MENTEE_DEFAULT",
  MENTOR_DEFAULT: "MENTOR_DEFAULT",
  EXECUTIVE_READ: "EXECUTIVE_READ",
  OPERATIONS_FULL: "OPERATIONS_FULL",
  MARKETING_FULL: "MARKETING_FULL",
  SUPERADMIN: "SUPERADMIN",
} as const;

export type AccessProfileCode = (typeof ACCESS_PROFILE_CODES)[keyof typeof ACCESS_PROFILE_CODES];

export const ACCOUNT_STATUSES = {
  PENDING: "PENDING",
  ACTIVE: "ACTIVE",
  SUSPENDED: "SUSPENDED",
  DISABLED: "DISABLED",
} as const;

export type AccountStatus = (typeof ACCOUNT_STATUSES)[keyof typeof ACCOUNT_STATUSES];

export const PERMISSION_EFFECTS = {
  ALLOW: "ALLOW",
  DENY: "DENY",
} as const;

export type PermissionEffect = (typeof PERMISSION_EFFECTS)[keyof typeof PERMISSION_EFFECTS];

export interface PermissionOverride {
  effect: PermissionEffect;
  expiresAt: Date | null;
  permissionKey: string;
}

export interface AuthorizationActor {
  accessProfileCode: AccessProfileCode;
  accountStatus: AccountStatus;
  overrides: readonly PermissionOverride[];
  roleCode: RoleCode;
  userId: string;
}
