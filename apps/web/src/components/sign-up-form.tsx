"use client";

import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  PASSWORD_POLICY_ERROR,
  satisfiesPasswordPolicy,
} from "@platform/auth/password-policy";
import { Alert, AlertDescription, AlertTitle } from "@platform/ui/components/alert";
import { Button, buttonVariants } from "@platform/ui/components/button";
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@platform/ui/components/field";
import { Input } from "@platform/ui/components/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@platform/ui/components/select";
import { Spinner } from "@platform/ui/components/spinner";
import { cn } from "@platform/ui/lib/utils";
import { useForm } from "@tanstack/react-form";
import { AlertCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";

import { registerAccount } from "@/lib/api/account";
import { ApiError } from "@/lib/api/client";
import {
  PasswordInput,
  PasswordMatchFeedback,
  PasswordPolicyFeedback,
} from "@/components/auth/password-input";

type RegistrationKind = "MENTEE" | "MENTOR" | "STAFF";
type StaffRole = "CEO" | "COO" | "CMO";

const labels: Record<RegistrationKind, { description: string; title: string }> = {
  MENTEE: {
    title: "Mentee",
    description: "Join Bootcamps and access learning resources.",
  },
  MENTOR: {
    title: "Mentor",
    description: "Apply to guide ResearchGap programs.",
  },
  STAFF: {
    title: "Staff",
    description: "Apply for an organizational account.",
  },
};

const registrationSchema = z
  .object({
    name: z.string().trim().min(2, "Name must be at least 2 characters").max(100),
    email: z.email("Enter a valid email address"),
    password: z
      .string()
      .min(PASSWORD_MIN_LENGTH, `Password must be at least ${PASSWORD_MIN_LENGTH} characters`)
      .max(PASSWORD_MAX_LENGTH)
      .refine(satisfiesPasswordPolicy, PASSWORD_POLICY_ERROR),
    confirmPassword: z.string().min(1, "Confirm your password"),
    requestedRoleCode: z.enum(["CEO", "COO", "CMO"]),
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export default function SignUpForm({ kind }: { kind: RegistrationKind }) {
  const router = useRouter();
  const [requestError, setRequestError] = useState<string | null>(null);
  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      requestedRoleCode: "COO" as StaffRole,
    },
    validators: { onSubmit: registrationSchema },
    onSubmit: async ({ value }) => {
      setRequestError(null);
      try {
        await registerAccount({
          kind,
          name: value.name,
          email: value.email,
          password: value.password,
          ...(kind === "STAFF" ? { requestedRoleCode: value.requestedRoleCode } : {}),
        });
        router.replace(kind === "MENTEE" ? "/dashboard" : "/account");
        router.refresh();
      } catch (error) {
        setRequestError(
          error instanceof ApiError
            ? error.message
            : "Your account could not be created. Please try again.",
        );
      }
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-3 gap-2" role="group" aria-label="Account type">
        {(Object.keys(labels) as RegistrationKind[]).map((option) => (
          <Link
            key={option}
            href={`/register?kind=${option.toLowerCase()}`}
            className={cn(
              buttonVariants({ variant: option === kind ? "secondary" : "outline" }),
              "h-auto min-h-16 flex-col gap-1 whitespace-normal px-2 py-2 text-center",
            )}
          >
            <span>{labels[option].title}</span>
            <span className="hidden text-xs font-normal text-muted-foreground sm:block">
              {option === "MENTEE" ? "Instant access" : "Approval required"}
            </span>
          </Link>
        ))}
      </div>

      <p className="text-sm text-muted-foreground">{labels[kind].description}</p>

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
              <AlertTitle>Unable to create account</AlertTitle>
              <AlertDescription>{requestError}</AlertDescription>
            </Alert>
          ) : null}

          <form.Field name="name">
            {(field) => (
              <Field data-invalid={field.state.meta.errors.length > 0}>
                <FieldLabel htmlFor={field.name}>Full name</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  autoComplete="name"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={field.state.meta.errors.length > 0}
                />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>

          <form.Field name="email">
            {(field) => (
              <Field data-invalid={field.state.meta.errors.length > 0}>
                <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                <Input
                  id={field.name}
                  name={field.name}
                  type="email"
                  autoComplete="email"
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
                <PasswordInput
                  id={field.name}
                  name={field.name}
                  autoComplete="new-password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={field.state.meta.errors.length > 0}
                />
                <PasswordPolicyFeedback password={field.state.value} />
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>

          <form.Field name="confirmPassword">
            {(field) => (
              <Field data-invalid={field.state.meta.errors.length > 0}>
                <FieldLabel htmlFor={field.name}>Confirm password</FieldLabel>
                <PasswordInput
                  id={field.name}
                  name={field.name}
                  autoComplete="new-password"
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  aria-invalid={field.state.meta.errors.length > 0}
                />
                {field.state.meta.errors.length === 0 ? (
                  <form.Subscribe selector={(state) => state.values.password}>
                    {(password) => (
                      <PasswordMatchFeedback password={password} confirmation={field.state.value} />
                    )}
                  </form.Subscribe>
                ) : null}
                <FieldError errors={field.state.meta.errors} />
              </Field>
            )}
          </form.Field>

          {kind === "STAFF" ? (
            <form.Field name="requestedRoleCode">
              {(field) => (
                <Field>
                  <FieldLabel htmlFor={field.name}>Requested staff role</FieldLabel>
                  <Select
                    value={field.state.value}
                    onValueChange={(value) => field.handleChange(value as StaffRole)}
                  >
                    <SelectTrigger id={field.name} className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="CEO">CEO — executive access</SelectItem>
                        <SelectItem value="COO">COO — operations access</SelectItem>
                        <SelectItem value="CMO">CMO — content access</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>
              )}
            </form.Field>
          ) : null}

          <form.Subscribe selector={(state) => state.isSubmitting}>
            {(isSubmitting) => (
              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? <Spinner data-icon="inline-start" /> : null}
                {isSubmitting ? "Creating account…" : `Register as ${labels[kind].title}`}
              </Button>
            )}
          </form.Subscribe>

          <FieldDescription className="text-center">
            Already have an account? <Link href="/login">Log in</Link>
          </FieldDescription>
        </FieldGroup>
      </form>
    </div>
  );
}
