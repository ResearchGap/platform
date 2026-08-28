import { redirect } from "next/navigation";

import { getServerAuthContext } from "@/lib/server-auth";

export default async function MarketingLayout({ children }: { children: React.ReactNode }) {
  const context = await getServerAuthContext();
  if (context?.account.access.roleCode !== "CMO") redirect("/dashboard");
  return children;
}
