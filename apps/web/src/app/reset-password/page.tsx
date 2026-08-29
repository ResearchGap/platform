import type { Metadata } from "next";

import { AuthCard } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = { title: "Reset password" };

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ requestId?: string; token?: string }>;
}) {
  const query = await searchParams;
  return (
    <AuthCard
      title="Choose a new password"
      description="Use a strong password you do not reuse elsewhere."
    >
      <ResetPasswordForm requestId={query.requestId ?? null} token={query.token ?? null} />
    </AuthCard>
  );
}
