import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_POLICY_ERROR,
  satisfiesPasswordPolicy,
} from "@platform/auth/password-policy";
import { z } from "zod";

import type { PublicRegistration } from "./identity.types.js";

const credentials = {
  name: z.string().trim().min(2).max(100),
  email: z.email(),
  password: z
    .string()
    .min(PASSWORD_MIN_LENGTH)
    .max(PASSWORD_MAX_LENGTH)
    .refine(satisfiesPasswordPolicy, PASSWORD_POLICY_ERROR),
} as const;

export const publicRegistrationSchema: z.ZodType<PublicRegistration> = z.discriminatedUnion(
  "kind",
  [
    z.object({ ...credentials, kind: z.literal("MENTEE") }),
    z.object({ ...credentials, kind: z.literal("MENTOR") }),
    z.object({
      ...credentials,
      kind: z.literal("STAFF"),
      requestedRoleCode: z.enum(["CEO", "COO", "CMO"]),
    }),
  ],
);
