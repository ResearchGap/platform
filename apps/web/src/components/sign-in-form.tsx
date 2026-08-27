"use client";

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
import { AlertCircle } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

import { authClient } from "@/lib/auth-client";

const loginSchema = z.object({
  email: z.email("Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

export default function SignInForm({ nextPath = "/dashboard" }: { nextPath?: Route }) {
  const router = useRouter();
  const [requestError, setRequestError] = useState<string | null>(null);
  const form = useForm({
    defaultValues: { email: "", password: "" },
    validators: { onSubmit: loginSchema },
    onSubmit: async ({ value }) => {
      setRequestError(null);
      const result = await authClient.signIn.email(value);
      if (result.error) {
        setRequestError(result.error.message ?? "Email or password is incorrect.");
        return;
      }
      router.replace(nextPath);
      router.refresh();
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
            <AlertTitle>Unable to log in</AlertTitle>
            <AlertDescription>{requestError}</AlertDescription>
          </Alert>
        ) : null}

        <form.Field name="email">
          {(field) => (
            <Field data-invalid={field.state.meta.errors.length > 0}>
              <FieldLabel htmlFor={field.name}>Email</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
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

        <form.Field name="password">
          {(field) => (
            <Field data-invalid={field.state.meta.errors.length > 0}>
              <FieldLabel htmlFor={field.name}>Password</FieldLabel>
              <Input
                id={field.name}
                name={field.name}
                type="password"
                autoComplete="current-password"
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
            <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
              {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
              {isSubmitting ? "Logging in…" : "Log in"}
            </Button>
          )}
        </form.Subscribe>

        <FieldDescription className="text-center">
          New to ResearchGap? <Link href="/register">Create an account</Link>
        </FieldDescription>
      </FieldGroup>
    </form>
  );
}
