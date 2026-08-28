import { redirect } from "next/navigation";

import { getServerAuthContext } from "@/lib/server-auth";

export default async function MentorLayout({ children }: { children: React.ReactNode }) {
  const context = await getServerAuthContext();
  if (context?.account.access.roleCode !== "MENTOR") {
    redirect("/dashboard");
  }
  return children;
}
