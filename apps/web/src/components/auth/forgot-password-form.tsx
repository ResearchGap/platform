"use client";

import { Alert, AlertDescription, AlertTitle } from "@platform/ui/components/alert";
import { Button } from "@platform/ui/components/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@platform/ui/components/field";
import { Input } from "@platform/ui/components/input";
import { Spinner } from "@platform/ui/components/spinner";
import { useForm } from "@tanstack/react-form";
import { AlertCircle, CircleCheck } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { z } from "zod";

import { requestPasswordReset } from "@/lib/api/password-reset";

const schema = z.object({ email: z.email("Enter a valid email address") });

export function ForgotPasswordForm() {
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [requestError, setRequestError] = useState<string | null>(null);
  const form = useForm({
    defaultValues: { email: "" },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      setRequestError(null);
      try {
        const result = await requestPasswordReset(value.email);
        setSuccessMessage(result.message);
      } catch {
        setRequestError("We could not process the request right now. Please try again.");
      }
    },
  });

  if (successMessage) {
    return (
      <div className="grid gap-5">
        <Alert>
          <CircleCheck aria-hidden="true" />
          <AlertTitle>Check your email</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
        <Button render={<Link href="/login" />} variant="outline">
          Back to Login
        </Button>
      </div>
    );
  }

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
            <AlertTitle>Unable to send reset email</AlertTitle>
            <AlertDescription>{requestError}</AlertDescription>
          </Alert>
        ) : null}
        <form.Field name="email">
          {(field) => (
            <Field data-invalid={field.state.meta.errors.length > 0}>
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>
              <Input
                id={field.name}
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={field.state.meta.errors.length > 0}
              />
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>
        <form.Subscribe selector={(state) => state.isSubmitting}>
          {(isSubmitting) => (
            <Button type="submit" size="lg" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
              {isSubmitting ? "Sending…" : "Send reset link"}
            </Button>
          )}
        </form.Subscribe>
        <Button render={<Link href="/login" />} variant="ghost">
          Back to Login
        </Button>
      </FieldGroup>
    </form>
  );
}
