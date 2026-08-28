"use client";

import { Alert, AlertDescription, AlertTitle } from "@platform/ui/components/alert";
import { Button } from "@platform/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@platform/ui/components/card";
import { Field, FieldGroup, FieldLabel } from "@platform/ui/components/field";
import { Input } from "@platform/ui/components/input";
import { Spinner } from "@platform/ui/components/spinner";
import { KeyRound, PowerOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { ApiError } from "@/lib/api/client";
import { createEnrollmentKey, deactivateEnrollmentKey } from "@/lib/api/mentor";
import type { EnrollmentKeyDetail } from "@/lib/api/mentor-types";

function errorMessage(error: unknown) {
  return error instanceof ApiError
    ? error.message
    : "The enrollment key action could not be completed.";
}

export function EnrollmentKeyCreator({ bootcampId }: { bootcampId: string }) {
  const router = useRouter();
  const [audience, setAudience] = useState<EnrollmentKeyDetail["audience"]>("MENTEE");
  const [expiresAt, setExpiresAt] = useState("");
  const [maxUses, setMaxUses] = useState("");
  const [rawKey, setRawKey] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  return (
    <Card>
      <CardHeader>
        <CardTitle>Create enrollment key</CardTitle>
        <CardDescription>
          The raw key is shown once. Copy it before leaving this page.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-5">
        <FieldGroup className="grid gap-4 md:grid-cols-3">
          <Field>
            <FieldLabel htmlFor="enrollment-key-audience">Audience</FieldLabel>
            <select
              id="enrollment-key-audience"
              className="h-10 rounded-md border bg-background px-3 font-normal"
              value={audience}
              onChange={(event) =>
                setAudience(event.target.value as EnrollmentKeyDetail["audience"])
              }
            >
              <option value="MENTEE">Mentee</option>
              <option value="MENTOR">Mentor</option>
            </select>
          </Field>
          <Field>
            <FieldLabel htmlFor="enrollment-key-expiry">Expires at (optional)</FieldLabel>
            <Input
              id="enrollment-key-expiry"
              type="datetime-local"
              value={expiresAt}
              onChange={(event) => setExpiresAt(event.target.value)}
            />
          </Field>
          <Field>
            <FieldLabel htmlFor="enrollment-key-max-uses">Maximum uses (optional)</FieldLabel>
            <Input
              id="enrollment-key-max-uses"
              type="number"
              min="1"
              step="1"
              placeholder="Unlimited"
              value={maxUses}
              onChange={(event) => setMaxUses(event.target.value)}
            />
          </Field>
        </FieldGroup>
        <Button
          className="self-start"
          disabled={pending}
          onClick={async () => {
            setPending(true);
            setRawKey(null);
            try {
              const result = await createEnrollmentKey(bootcampId, {
                audience,
                expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
                maxUses: maxUses ? Number(maxUses) : undefined,
              });
              setRawKey(result.rawKey);
              toast.success("Enrollment key created");
              router.refresh();
            } catch (error) {
              toast.error(errorMessage(error));
            } finally {
              setPending(false);
            }
          }}
        >
          {pending ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <KeyRound data-icon="inline-start" aria-hidden="true" />
          )}
          Create key
        </Button>
        {rawKey ? (
          <Alert>
            <KeyRound aria-hidden="true" />
            <AlertTitle>Copy this key now</AlertTitle>
            <AlertDescription>
              <code className="block break-all rounded-md bg-muted px-3 py-2 text-sm select-all">
                {rawKey}
              </code>
              <span>This value will not be shown again.</span>
            </AlertDescription>
          </Alert>
        ) : null}
      </CardContent>
    </Card>
  );
}

export function DeactivateEnrollmentKeyButton({
  bootcampId,
  keyId,
}: {
  bootcampId: string;
  keyId: string;
}) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  return (
    <Button
      size="sm"
      variant="outline"
      disabled={pending}
      onClick={async () => {
        if (!window.confirm("Deactivate this enrollment key?")) return;
        setPending(true);
        try {
          await deactivateEnrollmentKey(bootcampId, keyId);
          toast.success("Enrollment key deactivated");
          router.refresh();
        } catch (error) {
          toast.error(errorMessage(error));
          setPending(false);
        }
      }}
    >
      {pending ? (
        <Spinner data-icon="inline-start" />
      ) : (
        <PowerOff data-icon="inline-start" aria-hidden="true" />
      )}
      Deactivate
    </Button>
  );
}
