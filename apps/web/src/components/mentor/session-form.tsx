"use client";

import { Field, FieldLabel } from "@platform/ui/components/field";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/client";
import { createBootcampSession, updateBootcampSession } from "@/lib/api/mentor";
import type { ManagedBootcampSession } from "@/lib/api/mentor-types";
import type { SessionType } from "@/lib/api/public-types";

import {
  MentorInput,
  MentorTextarea,
  optionalValue,
  requiredValue,
  toDateTimeLocal,
  toIso,
} from "./form-fields";
import { MentorFormShell } from "./form-shell";

export function SessionForm({
  bootcampId,
  session,
}: {
  bootcampId: string;
  session?: ManagedBootcampSession;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  return (
    <MentorFormShell
      error={error}
      isPending={isPending}
      label={session ? "Save session" : "Create session"}
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        setIsPending(true);
        const data = new FormData(event.currentTarget);
        try {
          const input = {
            title: requiredValue(data, "title"),
            description: optionalValue(data, "description"),
            speakerName: optionalValue(data, "speakerName"),
            scheduledAt: toIso(requiredValue(data, "scheduledAt")),
            sessionType: requiredValue(data, "sessionType") as SessionType,
            venue: optionalValue(data, "venue"),
            moduleUrl: optionalValue(data, "moduleUrl"),
            preTestUrl: optionalValue(data, "preTestUrl"),
            postTestUrl: optionalValue(data, "postTestUrl"),
            feedbackUrl: optionalValue(data, "feedbackUrl"),
            recordingUrl: optionalValue(data, "recordingUrl"),
            coverAssetId: optionalValue(data, "coverAssetId"),
            sortOrder: Number(requiredValue(data, "sortOrder")),
          };
          if (session) await updateBootcampSession(bootcampId, session.id, input);
          else await createBootcampSession(bootcampId, input);
          toast.success(session ? "Session updated" : "Session created");
          router.push(`/mentor/bootcamps/${bootcampId}`);
          router.refresh();
        } catch (requestError) {
          setError(
            requestError instanceof ApiError
              ? requestError.message
              : "The session could not be saved.",
          );
          setIsPending(false);
        }
      }}
    >
      <MentorInput
        id="title"
        name="title"
        label="Title"
        defaultValue={session?.title}
        maxLength={240}
        required
      />
      <MentorTextarea
        id="description"
        name="description"
        label="Description"
        defaultValue={session?.description ?? ""}
        rows={5}
      />
      <MentorInput
        id="speakerName"
        name="speakerName"
        label="Speaker"
        defaultValue={session?.speakerName ?? ""}
        maxLength={240}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <MentorInput
          id="scheduledAt"
          name="scheduledAt"
          label="Schedule"
          type="datetime-local"
          defaultValue={session ? toDateTimeLocal(session.scheduledAt) : undefined}
          required
        />
        <Field>
          <FieldLabel htmlFor="sessionType">Session type</FieldLabel>
          <select
            id="sessionType"
            name="sessionType"
            defaultValue={session?.sessionType ?? "ONLINE"}
            className="h-10 rounded-md border border-input bg-transparent px-3 text-sm"
            required
          >
            <option value="ONLINE">Online</option>
            <option value="OFFLINE">Offline</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </Field>
      </div>
      <MentorInput
        id="venue"
        name="venue"
        label="Venue or meeting information"
        defaultValue={session?.venue ?? ""}
        maxLength={1000}
      />
      {(["moduleUrl", "preTestUrl", "postTestUrl", "feedbackUrl", "recordingUrl"] as const).map(
        (name) => (
          <MentorInput
            key={name}
            id={name}
            name={name}
            label={
              {
                moduleUrl: "Module URL",
                preTestUrl: "Pre-test URL",
                postTestUrl: "Post-test URL",
                feedbackUrl: "Feedback URL",
                recordingUrl: "Recording URL",
              }[name]
            }
            type="url"
            defaultValue={session?.[name] ?? ""}
            maxLength={2048}
            placeholder="https://"
          />
        ),
      )}
      <div className="grid gap-5 sm:grid-cols-2">
        <MentorInput
          id="coverAssetId"
          name="coverAssetId"
          label="Cover media asset ID"
          defaultValue={session?.coverAssetId ?? ""}
          maxLength={100}
        />
        <MentorInput
          id="sortOrder"
          name="sortOrder"
          label="Sort order"
          type="number"
          min={0}
          max={10000}
          defaultValue={session?.sortOrder ?? 0}
          required
        />
      </div>
    </MentorFormShell>
  );
}
