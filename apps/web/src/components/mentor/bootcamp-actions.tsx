"use client";

import { Button } from "@platform/ui/components/button";
import { Spinner } from "@platform/ui/components/spinner";
import { ArrowDown, ArrowUp, Send, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/client";
import { deleteBootcampSession, reorderBootcampSessions, submitBootcamp } from "@/lib/api/mentor";

function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : "The action could not be completed.";
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
