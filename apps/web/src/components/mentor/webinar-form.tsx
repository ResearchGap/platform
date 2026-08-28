"use client";

import { Field, FieldLabel } from "@platform/ui/components/field";
import { useRouter } from "next/navigation";
import type { Route } from "next";
import { useState } from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/client";
import { MediaUploader } from "@/components/media/media-uploader";
import { createWebinar, updateWebinar } from "@/lib/api/mentor";
import type { ManagedWebinarDetail } from "@/lib/api/mentor-types";
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

export function WebinarForm({
  basePath = "/mentor/webinars",
  webinar,
}: {
  basePath?: "/mentor/webinars" | "/operations/webinars";
  webinar?: ManagedWebinarDetail;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [coverAssetId, setCoverAssetId] = useState(webinar?.coverAssetId ?? "");
  return (
    <MentorFormShell
      error={error}
      isPending={isPending}
      label={webinar ? "Save Webinar" : "Create Webinar"}
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
            speakerName: optionalValue(data, "speakerName"),
            scheduledAt: toIso(requiredValue(data, "scheduledAt")),
            sessionType: requiredValue(data, "sessionType") as SessionType,
            venue: optionalValue(data, "venue"),
            registrationUrl: optionalValue(data, "registrationUrl"),
            meetingUrl: optionalValue(data, "meetingUrl"),
            coverAssetId: optionalValue(data, "coverAssetId"),
          };
          const saved = webinar
            ? await updateWebinar(webinar.id, input)
            : await createWebinar(input);
          toast.success(webinar ? "Webinar updated" : "Webinar created");
          router.push(`${basePath}/${saved.id}/edit` as Route);
          router.refresh();
        } catch (requestError) {
          setError(
            requestError instanceof ApiError
              ? requestError.message
              : "The Webinar could not be saved.",
          );
          setIsPending(false);
        }
      }}
    >
      <MentorInput
        id="title"
        name="title"
        label="Title"
        defaultValue={webinar?.title}
        maxLength={240}
        required
      />
      <MentorInput
        id="slug"
        name="slug"
        label="Slug"
        defaultValue={webinar?.slug}
        pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
        maxLength={160}
        required
      />
      <MentorTextarea
        id="description"
        name="description"
        label="Description"
        defaultValue={webinar?.description}
        rows={8}
        required
      />
      <MentorInput
        id="speakerName"
        name="speakerName"
        label="Speaker"
        defaultValue={webinar?.speakerName ?? ""}
        maxLength={240}
      />
      <div className="grid gap-5 sm:grid-cols-2">
        <MentorInput
          id="scheduledAt"
          name="scheduledAt"
          label="Schedule"
          type="datetime-local"
          defaultValue={webinar ? toDateTimeLocal(webinar.scheduledAt) : undefined}
          required
        />
        <Field>
          <FieldLabel htmlFor="sessionType">Session type</FieldLabel>
          <select
            id="sessionType"
            name="sessionType"
            defaultValue={webinar?.sessionType ?? "ONLINE"}
            className="h-10 rounded-md border border-input bg-transparent px-3 text-sm"
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
        label="Venue"
        defaultValue={webinar?.venue ?? ""}
        maxLength={500}
      />
      <MentorInput
        id="registrationUrl"
        name="registrationUrl"
        label="External registration URL"
        type="url"
        placeholder="https://"
        defaultValue={webinar?.registrationUrl ?? ""}
        maxLength={2048}
      />
      <MentorInput
        id="meetingUrl"
        name="meetingUrl"
        label="Protected meeting URL"
        description="Only management APIs expose this value."
        type="url"
        placeholder="https://"
        defaultValue={webinar?.meetingUrl ?? ""}
        maxLength={2048}
      />
      <input type="hidden" name="coverAssetId" value={coverAssetId} />
      <MediaUploader
        label="Webinar cover"
        initialAssetId={webinar?.coverAssetId}
        initialUrl={webinar?.cover?.externalUrl}
        onUploaded={(asset) => setCoverAssetId(asset.id)}
      />
    </MentorFormShell>
  );
}
