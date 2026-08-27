import { redirect } from "next/navigation";

import { MenteeShell } from "@/components/mentee/mentee-shell";
import { getServerAuthContext } from "@/lib/server-auth";

export default async function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const context = await getServerAuthContext();
  if (!context) {
    redirect("/login");
  }
  if (
    context.account.access.accountStatus !== "ACTIVE" ||
    context.account.access.roleCode !== "MENTEE"
  ) {
    redirect("/account");
  }

  return <MenteeShell account={context.account}>{children}</MenteeShell>;
}
