import prisma from "@platform/db";
import type { createAuth } from "@platform/auth";

import type {
  IdentityProvider,
  IdentitySignUpResult,
  RegistrationCredentials,
} from "../../modules/identity/identity.types.js";

type Auth = ReturnType<typeof createAuth>;

export class BetterAuthIdentityProvider implements IdentityProvider {
  constructor(private readonly auth: Auth) {}

  async signUp(credentials: RegistrationCredentials): Promise<IdentitySignUpResult> {
    const result = await this.auth.api.signUpEmail({
      body: credentials,
      returnHeaders: true,
    });

    const setCookie = result.headers.get("set-cookie");
    return {
      user: {
        id: result.response.user.id,
        email: result.response.user.email,
        name: result.response.user.name,
      },
      cookies: setCookie ? [setCookie] : [],
    };
  }

  async deleteUser(userId: string): Promise<void> {
    await prisma.user.deleteMany({ where: { id: userId } });
  }
}
