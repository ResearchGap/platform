"use client";

import { Button } from "@platform/ui/components/button";
import { Spinner } from "@platform/ui/components/spinner";
import { Archive, ArrowDown, ArrowUp, CheckCircle2, Send, Trash2, Upload } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/client";
import {
  archiveBootcamp,
  completeBootcamp,
  deleteBootcampSession,
  publishBootcamp,
  reorderBootcampSessions,
  submitBootcamp,
} from "@/lib/api/mentor";
import type { BootcampStatus } from "@/lib/api/mentor-types";

function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : "The action could not be completed.";
}

export function BootcampOperationalActions({
  bootcampId,
  status,
}: {
  bootcampId: string;
  status: BootcampStatus;
}) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const actions = [
    status === "DRAFT"
      ? {
          key: "submit",
          label: "Submit for review",
          icon: Send,
          run: () => submitBootcamp(bootcampId),
        }
      : null,
    status === "REVIEW"
      ? { key: "publish", label: "Publish", icon: Upload, run: () => publishBootcamp(bootcampId) }
      : null,
    status === "PUBLISHED"
      ? {
          key: "complete",
          label: "Mark completed",
          icon: CheckCircle2,
          run: () => completeBootcamp(bootcampId),
        }
      : null,
    status !== "ARCHIVED"
      ? { key: "archive", label: "Archive", icon: Archive, run: () => archiveBootcamp(bootcampId) }
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
            if (!window.confirm(`${label} this Bootcamp?`)) return;
            setPendingAction(key);
            try {
              await run();
              toast.success(`Bootcamp action completed: ${label.toLowerCase()}`);
              router.refresh();
            } catch (error) {
              toast.error(errorMessage(error));
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

export function SubmitBootcampButton({ bootcampId }: { bootcampId: string }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  return (
    <Button
      disabled={isPending}
      onClick={async () => {
        setIsPending(true);
        try {
          await submitBootcamp(bootcampId);
          toast.success("Bootcamp submitted for review");
          router.refresh();
        } catch (error) {
          toast.error(errorMessage(error));
          setIsPending(false);
        }
      }}
    >
      {isPending ? (
        <Spinner data-icon="inline-start" />
      ) : (
        <Send data-icon="inline-start" aria-hidden="true" />
      )}
      {isPending ? "Submitting…" : "Submit for review"}
    </Button>
  );
}

export function SessionActions({
  bootcampId,
  index,
  sessionId,
  sessionIds,
}: {
  bootcampId: string;
  index: number;
  sessionId: string;
  sessionIds: string[];
}) {
  const router = useRouter();
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  async function move(offset: number) {
    const next = [...sessionIds];
    const target = index + offset;
    const currentId = next[index];
    const targetId = next[target];
    if (!currentId || !targetId) return;
    next[index] = targetId;
    next[target] = currentId;
    setPendingAction("move");
    try {
      await reorderBootcampSessions(bootcampId, next);
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
    } finally {
      setPendingAction(null);
    }
  }
  return (
    <div className="flex flex-wrap gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Move session up"
        disabled={pendingAction !== null || index === 0}
        onClick={() => move(-1)}
      >
        <ArrowUp aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="icon-sm"
        aria-label="Move session down"
        disabled={pendingAction !== null || index === sessionIds.length - 1}
        onClick={() => move(1)}
      >
        <ArrowDown aria-hidden="true" />
      </Button>
      <Button
        type="button"
        variant="destructive"
        size="icon-sm"
        aria-label="Delete session"
        disabled={pendingAction !== null}
        onClick={async () => {
          if (!window.confirm("Delete this session?")) return;
          setPendingAction("delete");
          try {
            await deleteBootcampSession(bootcampId, sessionId);
            toast.success("Session deleted");
            router.refresh();
          } catch (error) {
            toast.error(errorMessage(error));
            setPendingAction(null);
          }
        }}
      >
        <Trash2 aria-hidden="true" />
      </Button>
    </div>
  );
}
