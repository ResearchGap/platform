import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_POLICY_ERROR,
  satisfiesPasswordPolicy,
} from "@platform/auth/password-policy";
import { z } from "zod";

export const passwordResetRequestSchema = z.object({
  email: z.email().trim().max(320),
});

export const completePasswordResetSchema = z.object({
  newPassword: z
    .string()
    .min(PASSWORD_MIN_LENGTH)
    .max(PASSWORD_MAX_LENGTH)
    .refine(satisfiesPasswordPolicy, PASSWORD_POLICY_ERROR),
  requestId: z.string().trim().min(1).max(128),
  token: z.string().trim().min(1).max(512),
});
