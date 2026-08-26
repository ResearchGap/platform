import { z } from "zod";

import type { PublicRegistration } from "./identity.types";

const credentials = {
  name: z.string().trim().min(2).max(100),
  email: z.email(),
  password: z.string().min(8).max(128),
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
