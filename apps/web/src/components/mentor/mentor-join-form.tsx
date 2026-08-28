"use client";

import { Alert, AlertDescription, AlertTitle } from "@platform/ui/components/alert";
import { Button } from "@platform/ui/components/button";
import { FieldGroup } from "@platform/ui/components/field";
import { Spinner } from "@platform/ui/components/spinner";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/client";
import { joinBootcampAsMentor } from "@/lib/api/mentor";

import { MentorInput } from "./form-fields";

export function MentorJoinForm() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  return (
    <form
      className="max-w-xl"
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        setIsPending(true);
        const data = new FormData(event.currentTarget);
        try {
          const bootcampId = String(data.get("bootcampId") ?? "").trim();
          await joinBootcampAsMentor(bootcampId, String(data.get("key") ?? "").trim());
          toast.success("Bootcamp joined");
          router.push(`/mentor/bootcamps/${bootcampId}`);
          router.refresh();
        } catch (requestError) {
          setError(
            requestError instanceof ApiError
              ? requestError.message
              : "The Bootcamp could not be joined.",
          );
          setIsPending(false);
        }
      }}
    >
      <FieldGroup>
        {error ? (
          <Alert variant="destructive">
            <AlertCircle aria-hidden="true" />
            <AlertTitle>Unable to join Bootcamp</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <MentorInput
          id="bootcampId"
          name="bootcampId"
          label="Bootcamp ID"
          description="Use the Bootcamp identifier supplied with your Mentor key."
          maxLength={100}
          required
        />
        <MentorInput
          id="key"
          name="key"
          label="Mentor enrollment key"
          autoComplete="off"
          maxLength={200}
          minLength={20}
          required
        />
        <Button type="submit" disabled={isPending} className="self-start">
          {isPending ? <Spinner data-icon="inline-start" /> : null}
          {isPending ? "Joining…" : "Join Bootcamp"}
        </Button>
      </FieldGroup>
    </form>
  );
}
