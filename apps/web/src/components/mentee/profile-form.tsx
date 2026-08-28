"use client";

import { Alert, AlertDescription, AlertTitle } from "@platform/ui/components/alert";
import { Button } from "@platform/ui/components/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@platform/ui/components/field";
import { Input } from "@platform/ui/components/input";
import { Spinner } from "@platform/ui/components/spinner";
import { useForm } from "@tanstack/react-form";
import { AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { updateCurrentProfile } from "@/lib/api/account";
import { ApiError } from "@/lib/api/client";
import type { RoleCode, UserProfile } from "@/lib/api/mentee-types";

const profileSchema = z.object({
  nickname: z.string().trim().max(100),
  whatsapp: z.string().trim().max(50),
  institution: z.string().trim().max(200),
  researchField: z.string().trim().max(200),
  affiliation: z.string().trim().max(200),
  biography: z.string().trim().max(2_000),
  expertise: z.string().trim().max(2_000),
});

export function ProfileForm({ profile, role }: { profile: UserProfile; role: RoleCode }) {
  const router = useRouter();
  const [requestError, setRequestError] = useState<string | null>(null);
  const form = useForm({
    defaultValues: {
      nickname: profile.nickname ?? "",
      whatsapp: profile.whatsapp ?? "",
      institution: profile.institution ?? "",
      researchField: profile.researchField ?? "",
      affiliation: profile.affiliation ?? "",
      biography: profile.biography ?? "",
      expertise: profile.expertise ?? "",
    },
    validators: { onSubmit: profileSchema },
    onSubmit: async ({ value }) => {
      setRequestError(null);
      try {
        await updateCurrentProfile({
          nickname: value.nickname || null,
          whatsapp: value.whatsapp || null,
          institution: value.institution || null,
          researchField: value.researchField || null,
          ...(role === "MENTOR"
            ? {
                affiliation: value.affiliation || null,
                biography: value.biography || null,
                expertise: value.expertise || null,
              }
            : {}),
        });
        toast.success("Profile updated");
        router.refresh();
      } catch (error) {
        setRequestError(
          error instanceof ApiError ? error.message : "Your profile could not be updated.",
        );
      }
    },
  });

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        event.stopPropagation();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        {requestError ? (
          <Alert variant="destructive">
            <AlertCircle aria-hidden="true" />
            <AlertTitle>Unable to update profile</AlertTitle>
            <AlertDescription>{requestError}</AlertDescription>
          </Alert>
        ) : null}
        {(
          [
            ["nickname", "Nickname", "How you would like to be addressed"],
            ["whatsapp", "WhatsApp", "Contact number"],
            ["institution", "Institution", "University or organization"],
            ["researchField", "Research field", "Your primary field of interest"],
            ...(role === "MENTOR"
              ? ([
                  ["affiliation", "Affiliation", "Professional or academic affiliation"],
                  ["expertise", "Expertise", "Areas of expertise"],
                  ["biography", "Biography", "Short professional biography"],
                ] as const)
              : []),
          ] as const
        ).map(([name, label, placeholder]) => (
          <form.Field key={name} name={name}>
            {(field) => (
              <Field data-invalid={field.state.meta.errors.length > 0}>
                <FieldLabel htmlFor={field.name}>{label}</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  placeholder={placeholder}
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={field.state.meta.errors.length > 0}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>
        ))}
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" disabled={isSubmitting} className="self-start">
              {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
              {isSubmitting ? "Saving…" : "Save profile"}
            </Button>
          )}
        </form.Subscribe>
      </FieldGroup>
    </form>
  );
}
