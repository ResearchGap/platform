import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@platform/ui/components/card";
import type { Metadata } from "next";

import { RoleBadge } from "@/components/auth/role-badge";
import { ProfileForm } from "@/components/mentee/profile-form";
import { PageHeading } from "@/components/public/page-heading";
import { getServerAuthContext } from "@/lib/server-auth";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const context = await getServerAuthContext();
  if (!context) {
    return null;
  }
  const isMentor = context.account.access.roleCode === "MENTOR";

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <PageHeading
        eyebrow="Account"
        title={`${isMentor ? "Mentor" : "Mentee"} profile`}
        description={
          isMentor
            ? "Keep your professional and ResearchGap profile information up to date."
            : "Keep your ResearchGap application profile information up to date."
        }
      />
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{context.account.user.name}</CardTitle>
            <RoleBadge role={context.account.access.roleCode} />
          </div>
          <CardDescription>{context.account.user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm profile={context.account.profile} role={context.account.access.roleCode} />
        </CardContent>
      </Card>
    </div>
  );
}
