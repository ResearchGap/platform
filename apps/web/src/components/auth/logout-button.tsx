"use client";

import { Button } from "@platform/ui/components/button";
import { LogOut } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { authClient } from "@/lib/auth-client";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);

  return (
    <Button
      type="button"
      variant="ghost"
      size={compact ? "icon" : "default"}
      disabled={isPending}
      aria-label={compact ? "Log out" : undefined}
      onClick={async () => {
        setIsPending(true);
        await authClient.signOut();
        router.replace("/");
        router.refresh();
      }}
    >
      <LogOut data-icon="inline-start" aria-hidden="true" />
      {compact ? null : isPending ? "Logging out…" : "Log out"}
    </Button>
  );
}
