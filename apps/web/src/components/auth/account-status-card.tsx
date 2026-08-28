import { Alert, AlertDescription, AlertTitle } from "@platform/ui/components/alert";
import { Badge } from "@platform/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@platform/ui/components/card";
import { CircleAlert, Clock3, ShieldCheck, UserRoundX } from "lucide-react";
import Link from "next/link";

import type { CurrentAccount } from "@/lib/api/mentee-types";

import { LogoutButton } from "./logout-button";
import { RoleBadge } from "./role-badge";

function accountState(account: CurrentAccount) {
  if (account.access.accountStatus === "SUSPENDED") {
    return {
      icon: CircleAlert,
      title: "Account suspended",
      description: "Your application access is temporarily suspended. Contact ResearchGap support.",
    };
  }
  if (account.access.accountStatus === "DISABLED") {
    return {
      icon: UserRoundX,
      title: "Account disabled",
      description: "This account cannot access the application. Contact ResearchGap support.",
    };
  }
  if (account.approval?.status === "REJECTED") {
    return {
      icon: UserRoundX,
      title: "Application not approved",
      description:
        account.approval.reviewNote ??
        "Your account application was reviewed but could not be approved.",
    };
  }
  if (account.access.accountStatus === "PENDING") {
    return {
      icon: Clock3,
      title: "Application under review",
      description: "Your account is registered and awaiting approval from ResearchGap staff.",
    };
  }
  return {
    icon: ShieldCheck,
    title: "Account active",
    description:
      "Your account is active. The experience for this role will be available in Phase 5C.",
  };
}

export function AccountStatusCard({ account }: { account: CurrentAccount }) {
  const state = accountState(account);
  const Icon = state.icon;

  return (
    <Card className="w-full max-w-xl">
      <CardHeader className="items-start">
        <div className="flex size-11 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Icon aria-hidden="true" />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <CardTitle>{state.title}</CardTitle>
          <Badge variant="secondary">{account.access.accountStatus}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <p className="text-sm leading-6 text-muted-foreground">{state.description}</p>
        <Alert>
          <AlertTitle>{account.user.name}</AlertTitle>
          <AlertDescription className="flex flex-wrap items-center gap-2">
            <span>{account.user.email}</span>
            <RoleBadge role={account.access.roleCode} />
          </AlertDescription>
        </Alert>
        <div className="flex flex-wrap gap-3">
          <LogoutButton />
          <Link href="/" className="text-sm font-medium text-primary hover:underline">
            Return to public site
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}
