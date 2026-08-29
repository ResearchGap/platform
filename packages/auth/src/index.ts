import prisma from "@platform/db";
import { env } from "@platform/env/server";
import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { APIError, createAuthMiddleware } from "better-auth/api";

import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_POLICY_ERROR,
  satisfiesPasswordPolicy,
} from "./password-policy.js";

interface AuthLifecycle {
  isPasswordResetOperationTrusted?: () => boolean;
  onUserCreated?: (user: { id: string }) => Promise<void>;
  onPasswordReset?: (input: { user: { id: string } }) => Promise<void>;
  sendResetPassword?: (input: {
    token: string;
    url: string;
    user: { email: string; id: string; name: string };
  }) => Promise<void>;
}

export function createAuth(lifecycle: AuthLifecycle = {}) {
  return betterAuth({
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),

    trustedOrigins: [env.CORS_ORIGIN],
    emailAndPassword: {
      enabled: true,
      minPasswordLength: PASSWORD_MIN_LENGTH,
      maxPasswordLength: PASSWORD_MAX_LENGTH,
      resetPasswordTokenExpiresIn: 3600,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: lifecycle.sendResetPassword,
      onPasswordReset: lifecycle.onPasswordReset,
    },
    hooks: {
      before: createAuthMiddleware(async (context) => {
        const isPasswordResetEndpoint =
          context.path === "/request-password-reset" || context.path === "/reset-password";
        if (isPasswordResetEndpoint && !lifecycle.isPasswordResetOperationTrusted?.()) {
          throw new APIError("NOT_FOUND");
        }

        if (context.path !== "/sign-up/email" && context.path !== "/reset-password") {
          return;
        }
        const password =
          context.path === "/reset-password" ? context.body?.newPassword : context.body?.password;
        if (typeof password !== "string" || !satisfiesPasswordPolicy(password)) {
          throw new APIError("BAD_REQUEST", { message: PASSWORD_POLICY_ERROR });
        }
      }),
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
