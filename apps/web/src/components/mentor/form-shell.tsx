"use client";

import { Alert, AlertDescription, AlertTitle } from "@platform/ui/components/alert";
import { Button } from "@platform/ui/components/button";
import { FieldGroup } from "@platform/ui/components/field";
import { Spinner } from "@platform/ui/components/spinner";
import { AlertCircle } from "lucide-react";
import type { FormEvent, ReactNode } from "react";

export function MentorFormShell({
  children,
  error,
  isPending,
  label,
  onSubmit,
}: {
  children: ReactNode;
  error: string | null;
  isPending: boolean;
  label: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <form onSubmit={onSubmit} className="max-w-3xl">
      <FieldGroup>
        {error ? (
          <Alert variant="destructive">
            <AlertCircle aria-hidden="true" />
            <AlertTitle>Unable to save</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {children}
        <Button type="submit" disabled={isPending} className="self-start">
          {isPending ? <Spinner data-icon="inline-start" /> : null}
          {isPending ? "Saving…" : label}
        </Button>
      </FieldGroup>
    </form>
  );
}
