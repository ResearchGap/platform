import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AccountStatusCard } from "@/components/auth/account-status-card";
import { getServerAuthContext } from "@/lib/server-auth";

export const metadata: Metadata = { title: "Account status" };

export default async function AccountPage() {
  const context = await getServerAuthContext();
  if (!context) {
    redirect("/login");
  }
  if (
    context.account.access.accountStatus === "ACTIVE" &&
    ["MENTEE", "MENTOR", "CEO", "COO", "CMO", "SUPERADMIN"].includes(
      context.account.access.roleCode,
    )
  ) {
    redirect("/dashboard");
  }

  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 px-4 py-10">
      <AccountStatusCard account={context.account} />
    </main>
  );
}
