import prisma from "@platform/db";
import { env } from "@platform/env/server";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

interface AuthLifecycle {
  onUserCreated?: (user: { id: string }) => Promise<void>;
}

export function createAuth(lifecycle: AuthLifecycle = {}) {
  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),

    trustedOrigins: [env.CORS_ORIGIN],
    emailAndPassword: {
      enabled: true,
    },
    secret: env.BETTER_AUTH_SECRET,
    baseURL: env.BETTER_AUTH_URL,
    advanced: {
      defaultCookieAttributes: {
        sameSite: "none",
        secure: true,
        httpOnly: true,
      },
    },
    databaseHooks: lifecycle.onUserCreated
      ? {
          user: {
            create: {
              after: lifecycle.onUserCreated,
            },
          },
        }
      : undefined,
    plugins: [],
  });
}
