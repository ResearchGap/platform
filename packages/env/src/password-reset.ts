import "dotenv/config";
import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

const smtpSecureSchema = z.enum(["true", "false"]).transform((value) => value === "true");
const encryptionKeySchema = z.string().refine((value) => {
  if (/^[0-9a-fA-F]{64}$/.test(value)) {
    return true;
  }

  try {
    return Buffer.from(value, "base64").byteLength === 32;
  } catch {
    return false;
  }
}, "PASSWORD_RESET_ENCRYPTION_KEY must encode exactly 32 bytes as hex or base64");

export const passwordResetEnv = createEnv({
  server: {
    SMTP_HOST: z.string().trim().min(1),
    SMTP_PORT: z.coerce.number().int().min(1).max(65_535),
    SMTP_SECURE: smtpSecureSchema,
    SMTP_USER: z.string().trim().min(1),
    SMTP_PASSWORD: z.string().min(1),
    EMAIL_FROM: z.string().trim().min(1),
    PASSWORD_RESET_ENCRYPTION_KEY: encryptionKeySchema,
  },
  runtimeEnv: process.env,
  skipValidation: !!process.env.SKIP_ENV_VALIDATION,
  emptyStringAsUndefined: true,
});
