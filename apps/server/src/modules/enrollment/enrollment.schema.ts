import { z } from "zod";

import {
  BOOTCAMP_ENROLLMENT_STATUSES,
  ENROLLMENT_KEY_AUDIENCES,
  ENROLLMENT_KEY_STATUSES,
} from "./enrollment.types.js";

const dateTimeSchema = z
  .string()
  .datetime({ offset: true })
  .transform((value) => new Date(value));

export const createEnrollmentKeySchema = z.object({
  audience: z.enum(ENROLLMENT_KEY_AUDIENCES),
  expiresAt: dateTimeSchema.optional(),
  maxUses: z.number().int().min(1).max(1_000_000).optional(),
});

export const redeemEnrollmentKeySchema = z.object({
  key: z.string().trim().min(20).max(200),
});

export const assignMentorSchema = z.object({
  mentorId: z.string().trim().min(1).max(100),
});

export const enrollmentKeyListSchema = z.object({
  audience: z.enum(ENROLLMENT_KEY_AUDIENCES).optional(),
  cursor: z.string().trim().min(1).max(100).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z.enum(ENROLLMENT_KEY_STATUSES).optional(),
});

export const participantListSchema = z.object({
  cursor: z.string().trim().min(1).max(100).optional(),
  limit: z.coerce.number().int().min(1).max(100).default(25),
  status: z.enum(BOOTCAMP_ENROLLMENT_STATUSES).optional(),
});

export const myBootcampListSchema = z.object({
  cursor: z.string().trim().min(1).max(100).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z
    .enum([BOOTCAMP_ENROLLMENT_STATUSES.ACTIVE, BOOTCAMP_ENROLLMENT_STATUSES.COMPLETED])
    .optional(),
});

export const mentorListSchema = z.object({
  cursor: z.string().trim().min(1).max(100).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export const eligibleMentorListSchema = mentorListSchema.extend({
  search: z.string().trim().min(1).max(120).optional(),
});

export const enrollmentResourceIdSchema = z.string().trim().min(1).max(100);
