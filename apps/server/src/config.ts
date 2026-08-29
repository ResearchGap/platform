import { env } from "@platform/env/server";
import { passwordResetEnv } from "@platform/env/password-reset";

export const serverConfig = {
  corsOrigin: env.CORS_ORIGIN,
  email: {
    from: passwordResetEnv.EMAIL_FROM,
    host: passwordResetEnv.SMTP_HOST,
    password: passwordResetEnv.SMTP_PASSWORD,
    port: passwordResetEnv.SMTP_PORT,
    secure: passwordResetEnv.SMTP_SECURE,
    user: passwordResetEnv.SMTP_USER,
  },
  passwordResetEncryptionKey: passwordResetEnv.PASSWORD_RESET_ENCRYPTION_KEY,
  port: env.PORT,
  storage: {
    bucket: env.SUPABASE_STORAGE_BUCKET,
    secretKey: env.SUPABASE_SECRET_KEY,
    url: env.SUPABASE_URL,
  },
  url: env.BETTER_AUTH_URL,
} as const;
