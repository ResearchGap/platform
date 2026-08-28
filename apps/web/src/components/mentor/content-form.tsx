"use client";

import { Field, FieldLabel } from "@platform/ui/components/field";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/client";
import { createContent, updateContent } from "@/lib/api/mentor";
import type { ManagedContentDetail } from "@/lib/api/mentor-types";
import type { ContentType } from "@/lib/api/public-types";

import { MentorInput, MentorTextarea, optionalValue, requiredValue } from "./form-fields";
import { MentorFormShell } from "./form-shell";

export function ContentForm({ content }: { content?: ManagedContentDetail }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  return (
    <MentorFormShell
      error={error}
      isPending={isPending}
      label={content ? "Save content" : "Create draft"}
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        setIsPending(true);
        const data = new FormData(event.currentTarget);
        try {
          const input = {
            title: requiredValue(data, "title"),
            slug: requiredValue(data, "slug"),
            excerpt: optionalValue(data, "excerpt"),
            content: requiredValue(data, "content"),
            type: requiredValue(data, "type") as ContentType,
            coverAssetId: optionalValue(data, "coverAssetId"),
          };
          const saved = content
            ? await updateContent(content.id, input)
            : await createContent(input);
          toast.success(content ? "Content updated" : "Content draft created");
          router.push(`/mentor/content/${saved.id}/edit`);
          router.refresh();
        } catch (requestError) {
          setError(
            requestError instanceof ApiError
              ? requestError.message
              : "The content could not be saved.",
          );
          setIsPending(false);
        }
      }}
    >
      <MentorInput
        id="title"
        name="title"
        label="Title"
        defaultValue={content?.title}
        maxLength={240}
        required
      />
      <MentorInput
        id="slug"
        name="slug"
        label="Slug"
        description="Lowercase letters, numbers, and hyphens only."
        defaultValue={content?.slug}
        pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
        maxLength={160}
        required
      />
      <Field>
        <FieldLabel htmlFor="type">Content type</FieldLabel>
        <select
          id="type"
          name="type"
          defaultValue={content?.type ?? "ARTICLE"}
          className="h-10 rounded-md border border-input bg-transparent px-3 text-sm"
        >
          <option value="NEWS">News</option>
          <option value="ARTICLE">Article</option>
          <option value="ANNOUNCEMENT">Announcement</option>
        </select>
      </Field>
      <MentorTextarea
        id="excerpt"
        name="excerpt"
        label="Excerpt"
        defaultValue={content?.excerpt ?? ""}
        maxLength={1000}
        rows={3}
      />
      <MentorTextarea
        id="content"
        name="content"
        label="Content"
        description="Plain text is supported in this MVP editor."
        defaultValue={content?.content}
        rows={16}
        required
      />
      <MentorInput
        id="coverAssetId"
        name="coverAssetId"
        label="Cover media asset ID"
        defaultValue={content?.coverAssetId ?? ""}
        maxLength={100}
      />
    </MentorFormShell>
  );
}
