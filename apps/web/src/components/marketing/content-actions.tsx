"use client";

import { Button } from "@platform/ui/components/button";
import { Spinner } from "@platform/ui/components/spinner";
import { Archive, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/client";
import { archiveContent, publishContent } from "@/lib/api/mentor";
import type { ContentStatus } from "@/lib/api/mentor-types";

export function ContentOperationalActions({ id, status }: { id: string; status: ContentStatus }) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const actions = [
    status === "DRAFT"
      ? { key: "publish", label: "Publish", icon: Upload, run: () => publishContent(id) }
      : null,
    status !== "ARCHIVED"
      ? { key: "archive", label: "Archive", icon: Archive, run: () => archiveContent(id) }
      : null,
  ].filter((action): action is NonNullable<typeof action> => action !== null);

  return (
    <div className="flex flex-wrap gap-2">
      {actions.map(({ icon: Icon, key, label, run }) => (
        <Button
          key={key}
          variant={key === "archive" ? "outline" : "default"}
          disabled={pendingAction !== null}
          onClick={async () => {
            if (!window.confirm(`${label} this Research Content item?`)) return;
            setPendingAction(key);
            try {
              await run();
              toast.success(`Content ${label.toLowerCase()} action completed`);
              router.refresh();
            } catch (error) {
              toast.error(
                error instanceof ApiError
                  ? error.message
                  : "The content action could not be completed.",
              );
              setPendingAction(null);
            }
          }}
        >
          {pendingAction === key ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <Icon data-icon="inline-start" aria-hidden="true" />
          )}
          {label}
        </Button>
      ))}
    </div>
  );
}
