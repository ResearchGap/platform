"use client";

import { Button } from "@platform/ui/components/button";
import { Spinner } from "@platform/ui/components/spinner";
import { Archive, CheckCircle2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { archiveWebinar, completeWebinar, publishWebinar } from "@/lib/api/mentor";
import type { WebinarStatus } from "@/lib/api/mentor-types";
import { ApiError } from "@/lib/api/client";

export function WebinarOperationalActions({ id, status }: { id: string; status: WebinarStatus }) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const actions = [
    status === "DRAFT"
      ? { key: "publish", label: "Publish", icon: Upload, run: () => publishWebinar(id) }
      : null,
    status === "PUBLISHED"
      ? {
          key: "complete",
          label: "Mark completed",
          icon: CheckCircle2,
          run: () => completeWebinar(id),
        }
      : null,
    status !== "ARCHIVED"
      ? { key: "archive", label: "Archive", icon: Archive, run: () => archiveWebinar(id) }
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
            if (!window.confirm(`${label} this Webinar?`)) return;
            setPendingAction(key);
            try {
              await run();
              toast.success(`Webinar action completed: ${label.toLowerCase()}`);
              router.refresh();
            } catch (error) {
              toast.error(
                error instanceof ApiError
                  ? error.message
                  : "The Webinar action could not be completed.",
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
