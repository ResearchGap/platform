import { headers } from "next/headers";

import { getCurrentAccount } from "./api/account";
import { authClient } from "./auth-client";

async function requestHeaders() {
  const incoming = await headers();
  const cookie = incoming.get("cookie");
  const forwarded: Record<string, string> = {};
  if (cookie) {
    forwarded.cookie = cookie;
  }
  return forwarded;
}

export async function getServerSession() {
  const forwarded = await requestHeaders();
  const result = await authClient.getSession({
    fetchOptions: { headers: forwarded },
  });
  return result.data;
}

export async function getServerAuthContext() {
  const forwarded = await requestHeaders();
  const sessionResult = await authClient.getSession({
    fetchOptions: { headers: forwarded },
  });
  if (!sessionResult.data?.user) {
    return null;
  }

  return {
    account: await getCurrentAccount({ headers: forwarded }),
    session: sessionResult.data,
  };
}

export async function authenticatedRequestInit(): Promise<RequestInit> {
  return { headers: await requestHeaders() };
}
