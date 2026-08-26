import { z } from "zod";

import { WEBINAR_SESSION_TYPES, WEBINAR_STATUSES, WEBINAR_TIMINGS } from "./webinar.types";

const titleSchema = z.string().trim().min(1).max(240);
const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const descriptionSchema = z.string().trim().min(1).max(100_000);
const speakerNameSchema = z.string().trim().min(1).max(240);
const venueSchema = z.string().trim().min(1).max(500);
const mediaReferenceSchema = z.string().trim().min(1).max(100);
const scheduledAtSchema = z
  .string()
  .datetime({ offset: true })
  .transform((value) => new Date(value));
const externalUrlSchema = z
  .string()
  .trim()
  .max(2_048)
  .url()
  .regex(/^https?:\/\//i, "URL must use HTTP or HTTPS");

export const createWebinarSchema = z.object({
  title: titleSchema,
  slug: slugSchema,
  description: descriptionSchema,
  speakerName: speakerNameSchema.optional(),
  scheduledAt: scheduledAtSchema,
  sessionType: z.enum(WEBINAR_SESSION_TYPES),
  venue: venueSchema.optional(),
  registrationUrl: externalUrlSchema.optional(),
  meetingUrl: externalUrlSchema.optional(),
  coverAssetId: mediaReferenceSchema.optional(),
});

export const updateWebinarSchema = z
  .object({
    title: titleSchema.optional(),
    slug: slugSchema.optional(),
    description: descriptionSchema.optional(),
    speakerName: speakerNameSchema.nullable().optional(),
    scheduledAt: scheduledAtSchema.optional(),
    sessionType: z.enum(WEBINAR_SESSION_TYPES).optional(),
    venue: venueSchema.nullable().optional(),
    registrationUrl: externalUrlSchema.nullable().optional(),
    meetingUrl: externalUrlSchema.nullable().optional(),
    coverAssetId: mediaReferenceSchema.nullable().optional(),
  })
  .refine((input) => Object.keys(input).length > 0, "At least one field must be provided");

export const webinarListSchema = z.object({
  cursor: z.string().trim().min(1).max(100).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z.enum(WEBINAR_STATUSES).optional(),
  timing: z.enum(WEBINAR_TIMINGS).optional(),
});

export const publicWebinarListSchema = webinarListSchema.omit({ status: true });

export const webinarIdSchema = z.string().trim().min(1).max(100);
export const webinarSlugSchema = slugSchema;
