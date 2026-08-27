"use client";

import { Alert, AlertDescription, AlertTitle } from "@platform/ui/components/alert";
import { Button, buttonVariants } from "@platform/ui/components/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@platform/ui/components/field";
import { Input } from "@platform/ui/components/input";
import { Spinner } from "@platform/ui/components/spinner";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { ApiError } from "@/lib/api/client";
import { enrollInBootcamp } from "@/lib/api/mentee";

export function EnrollmentForm({ bootcampId }: { bootcampId: string }) {
  const [key, setKey] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  if (isComplete) {
    return (
      <div className="flex flex-col gap-5">
        <Alert>
          <CheckCircle2 aria-hidden="true" />
          <AlertTitle>Enrollment successful</AlertTitle>
          <AlertDescription>
            This Bootcamp is now available in My Bootcamps and your learning view.
          </AlertDescription>
        </Alert>
        <Link
          href={`/my-bootcamps/${bootcampId}`}
          className={buttonVariants({ variant: "brand", size: "lg" })}
        >
          Open learning view
        </Link>
      </div>
    );
  }

  return (
    <form
      onSubmit={async (event) => {
        event.preventDefault();
        setError(null);
        setIsPending(true);
        try {
          await enrollInBootcamp(bootcampId, key.trim());
          setIsComplete(true);
        } catch (requestError) {
          setError(
            requestError instanceof ApiError
              ? requestError.message
              : "Enrollment could not be completed. Please try again.",
          );
        } finally {
          setIsPending(false);
        }
      }}
    >
      <FieldGroup>
        {error ? (
          <Alert variant="destructive">
            <AlertCircle aria-hidden="true" />
            <AlertTitle>Enrollment unsuccessful</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <Field>
          <FieldLabel htmlFor="enrollment-key">Mentee enrollment key</FieldLabel>
          <Input
            id="enrollment-key"
            name="enrollment-key"
            autoComplete="off"
            placeholder="RG-…"
            value={key}
            onChange={(event) => setKey(event.target.value)}
            minLength={20}
            maxLength={200}
            required
          />
          <FieldDescription>
            Enter the key supplied by ResearchGap or your Bootcamp organizer.
          </FieldDescription>
        </Field>
        <Button type="submit" size="lg" disabled={isPending || key.trim().length < 20}>
          {isPending ? <Spinner data-icon="inline-start" /> : null}
          {isPending ? "Enrolling…" : "Enroll in Bootcamp"}
        </Button>
      </FieldGroup>
    </form>
  );
}
