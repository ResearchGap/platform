import { z } from "zod";

function optionalText(maxLength: number) {
  return z
    .union([z.string().trim().max(maxLength), z.null()])
    .transform((value) => (value === "" ? null : value))
    .optional();
}

export const updateUserProfileSchema = z
  .object({
    affiliation: optionalText(200),
    biography: optionalText(2_000),
    expertise: optionalText(2_000),
    institution: optionalText(200),
    nickname: optionalText(100),
    researchField: optionalText(200),
    whatsapp: optionalText(50),
  })
  .refine((value) => Object.values(value).some((field) => field !== undefined), {
    message: "At least one profile field is required",
  });
