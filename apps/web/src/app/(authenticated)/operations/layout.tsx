import { redirect } from "next/navigation";

import { getServerAuthContext } from "@/lib/server-auth";

export default async function OperationsLayout({ children }: { children: React.ReactNode }) {
  const context = await getServerAuthContext();
  if (context?.account.access.roleCode !== "COO") redirect("/dashboard");
  return children;
}
