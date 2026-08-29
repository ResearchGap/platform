import { z } from "zod";

import {
  ACCOUNT_STATUSES,
  PERMISSION_EFFECTS,
  ROLES,
} from "../../authorization/authorization.types.js";
import { isPermission } from "../../authorization/permissions.js";
import { APPROVAL_STATUSES } from "./identity.types.js";

const roleCode = z.enum(Object.values(ROLES));
const accountStatus = z.enum(Object.values(ACCOUNT_STATUSES));
const approvalStatus = z.enum(Object.values(APPROVAL_STATUSES));

export const adminApprovalListSchema = z.object({
  cursor: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  requestedRoleCode: roleCode.optional(),
  status: approvalStatus.optional(),
});

export const adminUserListSchema = z.object({
  accountStatus: accountStatus.optional(),
  approvalStatus: approvalStatus.optional(),
  cursor: z.string().trim().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  roleCode: roleCode.optional(),
});

export const updateAdminAccountStatusSchema = z.object({
  status: z.enum([ACCOUNT_STATUSES.ACTIVE, ACCOUNT_STATUSES.SUSPENDED, ACCOUNT_STATUSES.DISABLED]),
});

export const updateAdminRoleSchema = z.object({
  roleCode: z.enum([ROLES.MENTEE, ROLES.MENTOR, ROLES.CEO, ROLES.COO, ROLES.CMO]),
});

export const createPermissionOverrideSchema = z.object({
  effect: z.enum(Object.values(PERMISSION_EFFECTS)),
  expiresAt: z.coerce
    .date()
    .refine((date) => date > new Date(), "Expiry must be in the future")
    .optional(),
  permissionKey: z.string().refine(isPermission, "Unknown permission"),
  reason: z.string().trim().max(500).optional(),
});
