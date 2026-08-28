"use client";

import { Button } from "@platform/ui/components/button";
import { Spinner } from "@platform/ui/components/spinner";
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
      aria-busy={isPending}
      aria-label={compact ? (isPending ? "Logging out" : "Log out") : undefined}
      onClick={async () => {
        setIsPending(true);
        const result = await authClient.signOut();
        if (result.error) {
          setIsPending(false);
          return;
        }
        router.replace("/");
        router.refresh();
      }}
    >
      {isPending ? (
        <Spinner data-icon="inline-start" />
      ) : (
        <LogOut data-icon="inline-start" aria-hidden="true" />
      )}
      {compact ? null : isPending ? "Logging out…" : "Log out"}
    </Button>
  );
}
