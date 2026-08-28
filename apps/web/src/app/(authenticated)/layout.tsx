import { redirect } from "next/navigation";

import { AuthenticatedShell } from "@/components/auth/authenticated-shell";
import { getServerAuthContext } from "@/lib/server-auth";

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const context = await getServerAuthContext();
  if (!context) {
    redirect("/login");
  }
  if (
    context.account.access.accountStatus !== "ACTIVE" ||
    !["MENTEE", "MENTOR", "COO", "SUPERADMIN"].includes(context.account.access.roleCode)
  ) {
    redirect("/account");
  }

  return <AuthenticatedShell account={context.account}>{children}</AuthenticatedShell>;
}
