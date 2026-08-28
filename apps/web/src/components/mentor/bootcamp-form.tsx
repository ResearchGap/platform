"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/client";
import { createBootcamp, updateBootcamp } from "@/lib/api/mentor";
import type { ManagedBootcampDetail } from "@/lib/api/mentor-types";

import {
  MentorInput,
  MentorTextarea,
  optionalValue,
  requiredValue,
  toDateTimeLocal,
  toIso,
} from "./form-fields";
import { MentorFormShell } from "./form-shell";

export function BootcampForm({ bootcamp }: { bootcamp?: ManagedBootcampDetail }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  return (
    <MentorFormShell
      error={error}
      isPending={isPending}
      label={bootcamp ? "Save Bootcamp" : "Create Bootcamp"}
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        setIsPending(true);
        const data = new FormData(event.currentTarget);
        try {
          const input = {
            title: requiredValue(data, "title"),
            slug: requiredValue(data, "slug"),
            description: requiredValue(data, "description"),
            whatYouGet: optionalValue(data, "whatYouGet"),
            startDate: toIso(requiredValue(data, "startDate")),
            endDate: toIso(requiredValue(data, "endDate")),
            registrationDeadline: optionalValue(data, "registrationDeadline")
              ? toIso(requiredValue(data, "registrationDeadline"))
              : null,
            coverAssetId: optionalValue(data, "coverAssetId"),
          };
          const saved = bootcamp
            ? await updateBootcamp(bootcamp.id, input)
            : await createBootcamp(input);
          toast.success(bootcamp ? "Bootcamp updated" : "Bootcamp created");
          router.push(`/mentor/bootcamps/${saved.id}`);
          router.refresh();
        } catch (requestError) {
          setError(
            requestError instanceof ApiError
              ? requestError.message
              : "The Bootcamp could not be saved.",
          );
          setIsPending(false);
        }
      }}
    >
      <MentorInput
        id="title"
        name="title"
        label="Title"
        defaultValue={bootcamp?.title}
        maxLength={240}
        required
      />
      <MentorInput
        id="slug"
        name="slug"
        label="Slug"
        description="Lowercase letters, numbers, and hyphens only."
        defaultValue={bootcamp?.slug}
        pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
        maxLength={160}
        required
      />
      <MentorTextarea
        id="description"
        name="description"
        label="Description"
        defaultValue={bootcamp?.description}
        rows={8}
        required
      />
      <MentorTextarea
        id="whatYouGet"
        name="whatYouGet"
        label="What participants receive"
        defaultValue={bootcamp?.whatYouGet ?? ""}
        rows={5}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <MentorInput
          id="startDate"
          name="startDate"
          label="Start date and time"
          type="datetime-local"
          defaultValue={bootcamp ? toDateTimeLocal(bootcamp.startDate) : undefined}
          required
        />
        <MentorInput
          id="endDate"
          name="endDate"
          label="End date and time"
          type="datetime-local"
          defaultValue={bootcamp ? toDateTimeLocal(bootcamp.endDate) : undefined}
          required
        />
      </div>
      <MentorInput
        id="registrationDeadline"
        name="registrationDeadline"
        label="Registration deadline"
        type="datetime-local"
        defaultValue={
          bootcamp?.registrationDeadline
            ? toDateTimeLocal(bootcamp.registrationDeadline)
            : undefined
        }
      />
      <MentorInput
        id="coverAssetId"
        name="coverAssetId"
        label="Cover media asset ID"
        description="Use an existing ResearchGap media asset reference."
        defaultValue={bootcamp?.coverAssetId ?? ""}
        maxLength={100}
      />
    </MentorFormShell>
  );
}
