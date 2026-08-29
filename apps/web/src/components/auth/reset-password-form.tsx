"use client";

import {
  PASSWORD_REQUIREMENTS,
  PASSWORD_POLICY_ERROR,
  satisfiesPasswordPolicy,
} from "@platform/auth/password-policy";
import { Alert, AlertDescription, AlertTitle } from "@platform/ui/components/alert";
import { Button } from "@platform/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@platform/ui/components/field";
import { Input } from "@platform/ui/components/input";
import { Spinner } from "@platform/ui/components/spinner";
import { useForm } from "@tanstack/react-form";
import { AlertCircle, CircleCheck } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useState } from "react";
import { z } from "zod";

import { completePasswordReset } from "@/lib/api/password-reset";

const schema = z
  .object({
    password: z.string().refine(satisfiesPasswordPolicy, PASSWORD_POLICY_ERROR),
    confirmPassword: z.string(),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export function ResetPasswordForm({
  requestId,
  token,
}: {
  requestId: string | null;
  token: string | null;
}) {
  const [completed, setCompleted] = useState(false);
  const [requestError, setRequestError] = useState<string | null>(null);
  const form = useForm({
    defaultValues: { password: "", confirmPassword: "" },
    validators: { onSubmit: schema },
    onSubmit: async ({ value }) => {
      if (!requestId || !token) return;
      setRequestError(null);
      try {
        await completePasswordReset({ requestId, token, newPassword: value.password });
        setCompleted(true);
      } catch {
        setRequestError("This reset link is invalid or expired. Request a new link to continue.");
      }
    },
  });

  if (!requestId || !token) {
    return (
      <div className="grid gap-5">
        <Alert variant="destructive">
          <AlertCircle aria-hidden="true" />
          <AlertTitle>Reset link unavailable</AlertTitle>
          <AlertDescription>This password reset link is incomplete or invalid.</AlertDescription>
        </Alert>
        <Button render={<Link href={"/forgot-password" as Route} />}>Request a new link</Button>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="grid gap-5">
        <Alert>
          <CircleCheck aria-hidden="true" />
          <AlertTitle>Password updated</AlertTitle>
          <AlertDescription>You can now log in with your new password.</AlertDescription>
        </Alert>
        <Button render={<Link href="/login" />}>Return to Login</Button>
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
            <AlertTitle>Unable to reset password</AlertTitle>
            <AlertDescription>{requestError}</AlertDescription>
          </Alert>
        ) : null}
        <form.Field name="password">
          {(field) => (
            <Field data-invalid={field.state.meta.errors.length > 0}>
              <FieldLabel htmlFor={field.name}>New Password</FieldLabel>
              <Input
                id={field.name}
                type="password"
                autoComplete="new-password"
                value={field.state.value}
                onBlur={field.handleBlur}
                onChange={(event) => field.handleChange(event.target.value)}
                aria-invalid={field.state.meta.errors.length > 0}
              />
              <FieldDescription>{PASSWORD_REQUIREMENTS}</FieldDescription>
              <FieldError errors={field.state.meta.errors} />
            </Field>
          )}
        </form.Field>
        <form.Field name="confirmPassword">
          {(field) => (
            <Field data-invalid={field.state.meta.errors.length > 0}>
              <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
              <Input
                id={field.name}
                type="password"
                autoComplete="new-password"
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
              {isSubmitting ? "Updating…" : "Reset Password"}
            </Button>
          )}
        </form.Subscribe>
      </FieldGroup>
    </form>
  );
}
