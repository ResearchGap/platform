import { env } from "@platform/env/server";

export const serverConfig = {
  corsOrigin: env.CORS_ORIGIN,
  port: env.PORT,
  url: env.BETTER_AUTH_URL,
} as const;
