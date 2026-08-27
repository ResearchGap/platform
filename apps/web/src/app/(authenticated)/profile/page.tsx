import { Badge } from "@platform/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@platform/ui/components/card";
import type { Metadata } from "next";

import { ProfileForm } from "@/components/mentee/profile-form";
import { PageHeading } from "@/components/public/page-heading";
import { getServerAuthContext } from "@/lib/server-auth";

export const metadata: Metadata = { title: "Profile" };

export default async function ProfilePage() {
  const context = await getServerAuthContext();
  if (!context) {
    return null;
  }

  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <PageHeading
        eyebrow="Account"
        title="Mentee profile"
        description="Keep your ResearchGap application profile information up to date."
      />
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle>{context.account.user.name}</CardTitle>
            <Badge variant="secondary">Mentee</Badge>
          </div>
          <CardDescription>{context.account.user.email}</CardDescription>
        </CardHeader>
        <CardContent>
          <ProfileForm profile={context.account.profile} />
        </CardContent>
      </Card>
    </div>
  );
}
