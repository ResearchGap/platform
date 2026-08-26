import { z } from "zod";

import { RESEARCH_CONTENT_STATUSES, RESEARCH_CONTENT_TYPES } from "./content.types";

const titleSchema = z.string().trim().min(1).max(240);
const slugSchema = z
  .string()
  .trim()
  .min(1)
  .max(160)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);
const excerptSchema = z.string().trim().max(1_000);
const contentBodySchema = z.string().trim().min(1).max(1_000_000);
const mediaReferenceSchema = z.string().trim().min(1).max(100);

export const createResearchContentSchema = z.object({
  title: titleSchema,
  slug: slugSchema,
  excerpt: excerptSchema.optional(),
  content: contentBodySchema,
  type: z.enum(RESEARCH_CONTENT_TYPES),
  coverAssetId: mediaReferenceSchema.optional(),
});

export const updateResearchContentSchema = z
  .object({
    title: titleSchema.optional(),
    slug: slugSchema.optional(),
    excerpt: excerptSchema.nullable().optional(),
    content: contentBodySchema.optional(),
    type: z.enum(RESEARCH_CONTENT_TYPES).optional(),
    coverAssetId: mediaReferenceSchema.nullable().optional(),
  })
  .refine((input) => Object.keys(input).length > 0, "At least one field must be provided");

export const contentListSchema = z.object({
  cursor: z.string().trim().min(1).max(100).optional(),
  limit: z.coerce.number().int().min(1).max(50).default(20),
  type: z.enum(RESEARCH_CONTENT_TYPES).optional(),
  status: z.enum(RESEARCH_CONTENT_STATUSES).optional(),
});

export const publicContentListSchema = contentListSchema.omit({ status: true });

export const contentIdSchema = z.string().trim().min(1).max(100);
export const contentSlugSchema = slugSchema;
