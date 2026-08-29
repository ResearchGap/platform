import { z } from "zod";

import { BOOTCAMP_SESSION_TYPES, BOOTCAMP_STATUSES, BOOTCAMP_TIMINGS } from "./bootcamp.types.js";

const titleSchema = z.string().trim().min(1).max(240);
const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const descriptionSchema = z.string().trim().min(1).max(200_000);
const optionalTextSchema = z.string().trim().min(1).max(100_000);
const speakerNameSchema = z.string().trim().min(1).max(240);
const venueSchema = z.string().trim().min(1).max(1_000);
const mediaReferenceSchema = z.string().trim().min(1).max(100);
const dateTimeSchema = z
  .string()
  .datetime({ offset: true })
  .transform((value) => new Date(value));
const externalUrlSchema = z
  .string()
  .trim()
  .max(2_048)
  .url()
  .regex(/^https?:\/\//i, "URL must use HTTP or HTTPS");

function addDateIssues(
  input: { endDate: Date; registrationDeadline?: Date | null; startDate: Date },
  context: z.RefinementCtx,
) {
  if (input.endDate <= input.startDate) {
    context.addIssue({
      code: "custom",
      message: "endDate must be after startDate",
      path: ["endDate"],
    });
  }
  if (input.registrationDeadline && input.registrationDeadline > input.startDate) {
    context.addIssue({
      code: "custom",
      message: "registrationDeadline must not be after startDate",
      path: ["registrationDeadline"],
    });
  }
}

export const createBootcampSchema = z
  .object({
    title: titleSchema,
    slug: slugSchema,
    description: descriptionSchema,
    whatYouGet: optionalTextSchema.optional(),
    startDate: dateTimeSchema,
    endDate: dateTimeSchema,
    registrationDeadline: dateTimeSchema.optional(),
    coverAssetId: mediaReferenceSchema.optional(),
  })
  .superRefine(addDateIssues);

export const updateBootcampSchema = z
  .object({
    title: titleSchema.optional(),
    slug: slugSchema.optional(),
    description: descriptionSchema.optional(),
    whatYouGet: optionalTextSchema.nullable().optional(),
    startDate: dateTimeSchema.optional(),
    endDate: dateTimeSchema.optional(),
    registrationDeadline: dateTimeSchema.nullable().optional(),
    coverAssetId: mediaReferenceSchema.nullable().optional(),
  })
  .refine((input) => Object.keys(input).length > 0, "At least one field must be provided");

export const updateBootcampCoverSchema = z.object({
  coverAssetId: mediaReferenceSchema.nullable(),
});

export const bootcampListSchema = z.object({
  cursor: z.string().trim().min(1).max(100).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  status: z.enum(BOOTCAMP_STATUSES).optional(),
  timing: z.enum(BOOTCAMP_TIMINGS).optional(),
});

export const publicBootcampListSchema = bootcampListSchema.omit({ status: true });

export const createBootcampSessionSchema = z.object({
  title: titleSchema,
  description: optionalTextSchema.optional(),
  speakerName: speakerNameSchema.optional(),
  scheduledAt: dateTimeSchema,
  sessionType: z.enum(BOOTCAMP_SESSION_TYPES),
  venue: venueSchema.optional(),
  moduleUrl: externalUrlSchema.optional(),
  preTestUrl: externalUrlSchema.optional(),
  postTestUrl: externalUrlSchema.optional(),
  feedbackUrl: externalUrlSchema.optional(),
  recordingUrl: externalUrlSchema.optional(),
  coverAssetId: mediaReferenceSchema.optional(),
  sortOrder: z.number().int().min(0).max(10_000),
});

export const updateBootcampSessionSchema = z
  .object({
    title: titleSchema.optional(),
    description: optionalTextSchema.nullable().optional(),
    speakerName: speakerNameSchema.nullable().optional(),
    scheduledAt: dateTimeSchema.optional(),
    sessionType: z.enum(BOOTCAMP_SESSION_TYPES).optional(),
    venue: venueSchema.nullable().optional(),
    moduleUrl: externalUrlSchema.nullable().optional(),
    preTestUrl: externalUrlSchema.nullable().optional(),
    postTestUrl: externalUrlSchema.nullable().optional(),
    feedbackUrl: externalUrlSchema.nullable().optional(),
    recordingUrl: externalUrlSchema.nullable().optional(),
    coverAssetId: mediaReferenceSchema.nullable().optional(),
    sortOrder: z.number().int().min(0).max(10_000).optional(),
  })
  .refine((input) => Object.keys(input).length > 0, "At least one field must be provided");

export const reorderBootcampSessionsSchema = z.object({
  sessionIds: z.array(z.string().trim().min(1).max(100)).min(1).max(500),
});

export const bootcampIdSchema = z.string().trim().min(1).max(100);
export const bootcampSessionIdSchema = bootcampIdSchema;
export const bootcampSlugSchema = slugSchema;
