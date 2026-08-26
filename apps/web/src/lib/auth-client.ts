import { env } from "@platform/env/web";
import { createAuthClient } from "better-auth/react";

export const authClient = createAuthClient({
  baseURL: new URL("/api/auth", env.NEXT_PUBLIC_SERVER_URL).toString(),
});
