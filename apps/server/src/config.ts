import { env } from "@platform/env/server";

export const serverConfig = {
  corsOrigin: env.CORS_ORIGIN,
  port: env.PORT,
  storage: {
    bucket: env.SUPABASE_STORAGE_BUCKET,
    secretKey: env.SUPABASE_SECRET_KEY,
    url: env.SUPABASE_URL,
  },
  url: env.BETTER_AUTH_URL,
} as const;
