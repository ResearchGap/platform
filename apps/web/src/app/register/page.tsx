import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { AuthCard } from "@/components/auth/auth-card";
import SignUpForm from "@/components/sign-up-form";
import { getServerSession } from "@/lib/server-auth";

export const metadata: Metadata = { title: "Register" };

type RegistrationKind = "MENTEE" | "MENTOR" | "STAFF";

function registrationKind(value: string | undefined): RegistrationKind {
  const normalized = value?.toUpperCase();
  return normalized === "MENTOR" || normalized === "STAFF" ? normalized : "MENTEE";
}

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const [session, query] = await Promise.all([getServerSession(), searchParams]);
  if (session?.user) {
    redirect("/account");
  }
  const kind = registrationKind(query.kind);

  return (
    <AuthCard
      title="Create your account"
      description="Choose the account type that fits your role."
    >
      <SignUpForm kind={kind} />
    </AuthCard>
  );
}
