import type { Metadata, Route } from "next";
import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import SignInForm from "@/components/sign-in-form";
import { getServerSession } from "@/lib/server-auth";

export const metadata: Metadata = { title: "Log in" };

function safeNextPath(value: string | undefined): Route {
  return value?.startsWith("/") && !value.startsWith("//") ? (value as Route) : "/dashboard";
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const [session, query] = await Promise.all([getServerSession(), searchParams]);
  const nextPath = safeNextPath(query.next);
  if (session?.user) {
    redirect(nextPath);
  }

  return (
    <AuthCard title="Welcome back" description="Log in to continue your ResearchGap journey.">
      <SignInForm nextPath={nextPath} />
    </AuthCard>
  );
}
