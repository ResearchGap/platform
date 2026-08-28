import { redirect } from "next/navigation";

import { getServerAuthContext } from "@/lib/server-auth";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const context = await getServerAuthContext();
  if (context?.account.access.roleCode !== "SUPERADMIN") redirect("/dashboard");
  return children;
}
