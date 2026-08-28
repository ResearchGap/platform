"use client";

import { Button } from "@platform/ui/components/button";
import { Spinner } from "@platform/ui/components/spinner";
import { Plus, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/client";
import { assignBootcampMentor, removeBootcampMentor } from "@/lib/api/mentor";

function message(error: unknown) {
  return error instanceof ApiError ? error.message : "The Mentor assignment could not be updated.";
}

export function AssignMentorButton({
  bootcampId,
  mentorId,
}: {
  bootcampId: string;
  mentorId: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <Button
      size="sm"
      disabled={pending}
      onClick={async () => {
        setPending(true);
        try {
          await assignBootcampMentor(bootcampId, mentorId);
          toast.success("Mentor assigned");
          router.refresh();
        } catch (error) {
          toast.error(message(error));
          setPending(false);
        }
      }}
    >
      {pending ? (
        <Spinner data-icon="inline-start" />
      ) : (
        <Plus data-icon="inline-start" aria-hidden="true" />
      )}
      Assign
    </Button>
  );
}

export function RemoveMentorButton({
  bootcampId,
  mentorId,
}: {
  bootcampId: string;
  mentorId: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <Button
      size="sm"
      variant="destructive"
      disabled={pending}
      onClick={async () => {
        if (!window.confirm("Remove this Mentor assignment?")) return;
        setPending(true);
        try {
          await removeBootcampMentor(bootcampId, mentorId);
          toast.success("Mentor assignment removed");
          router.refresh();
        } catch (error) {
          toast.error(message(error));
          setPending(false);
        }
      }}
    >
      {pending ? (
        <Spinner data-icon="inline-start" />
      ) : (
        <Trash2 data-icon="inline-start" aria-hidden="true" />
      )}
      Remove
    </Button>
  );
}
