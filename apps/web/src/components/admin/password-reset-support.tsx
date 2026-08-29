"use client";

import { Alert, AlertDescription, AlertTitle } from "@platform/ui/components/alert";
import { Badge } from "@platform/ui/components/badge";
import { Button } from "@platform/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@platform/ui/components/card";
import { Input } from "@platform/ui/components/input";
import { Spinner } from "@platform/ui/components/spinner";
import { AlertCircle, Clipboard, KeyRound } from "lucide-react";
import { useState } from "react";

import {
  createManualPasswordReset,
  revealPasswordResetLink,
  type PasswordResetRequestSummary,
} from "@/lib/api/password-reset";
import { formatDateTime } from "@/lib/public-format";

export function PasswordResetSupport({
  initialRequests,
  userId,
}: {
  initialRequests: PasswordResetRequestSummary[];
  userId: string;
}) {
  const [requests, setRequests] = useState(initialRequests);
  const [revealed, setRevealed] = useState<{ requestId: string; url: string } | null>(null);
  const [pendingAction, setPendingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createManual() {
    if (!window.confirm("Generate a new one-hour manual reset link for this user?")) return;
    setError(null);
    setPendingAction("create");
    try {
      const created = await createManualPasswordReset(userId);
      setRequests((current) => [created, ...current]);
      setRevealed(null);
    } catch {
      setError("A new manual reset link could not be generated.");
    } finally {
      setPendingAction(null);
    }
  }

  async function reveal(requestId: string) {
    setError(null);
    setPendingAction(requestId);
    try {
      const result = await revealPasswordResetLink(requestId);
      setRevealed({ requestId, url: result.url });
      await navigator.clipboard.writeText(result.url);
      setRequests((current) =>
        current.map((request) =>
          request.id === requestId
            ? { ...request, manuallyRevealedAt: new Date().toISOString() }
            : request,
        ),
      );
    } catch {
      setError("The link is unavailable or expired. Generate a new manual reset instead.");
    } finally {
      setPendingAction(null);
    }
  }

  return (
    <Card>
      <CardHeader className="flex-row items-start justify-between gap-4">
        <div>
          <CardTitle>Password reset support</CardTitle>
          <CardDescription>
            Recent audit history and controlled recovery for delivery failures.
          </CardDescription>
        </div>
        <Button onClick={createManual} disabled={pendingAction !== null}>
          {pendingAction === "create" ? <Spinner data-icon="inline-start" /> : <KeyRound />}
          Generate manual link
        </Button>
      </CardHeader>
      <CardContent className="grid gap-4">
        {error ? (
          <Alert variant="destructive">
            <AlertCircle aria-hidden="true" />
            <AlertTitle>Action unavailable</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        {revealed ? (
          <div className="grid gap-2 rounded-lg border bg-muted/30 p-3">
            <p className="text-sm font-medium">Reset link revealed and copied</p>
            <div className="flex gap-2">
              <Input value={revealed.url} readOnly aria-label="Revealed password reset link" />
              <Button
                size="icon"
                variant="outline"
                aria-label="Copy password reset link"
                onClick={() => navigator.clipboard.writeText(revealed.url)}
              >
                <Clipboard />
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Share only through an approved support channel. The reveal is recorded.
            </p>
          </div>
        ) : null}
        {requests.length === 0 ? (
          <p className="text-sm text-muted-foreground">No password reset history for this user.</p>
        ) : (
          <div className="grid gap-3">
            {requests.map((request) => {
              const revealable =
                request.effectiveStatus !== "EXPIRED" &&
                request.effectiveStatus !== "COMPLETED" &&
                request.effectiveStatus !== "NO_ACCOUNT";
              return (
                <div
                  className="flex flex-col justify-between gap-3 rounded-lg border p-3 sm:flex-row sm:items-center"
                  key={request.id}
                >
                  <div className="grid gap-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">
                        {request.effectiveStatus.replaceAll("_", " ")}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {request.source.replaceAll("_", " ")} · {request.deliveryMode}
                      </span>
                    </div>
                    <p className="text-sm">Requested {formatDateTime(request.requestedAt)}</p>
                    {request.expiresAt ? (
                      <p className="text-xs text-muted-foreground">
                        Expires {formatDateTime(request.expiresAt)}
                        {request.manuallyRevealedAt
                          ? ` · Revealed ${formatDateTime(request.manuallyRevealedAt)}`
                          : ""}
                      </p>
                    ) : null}
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={!revealable || pendingAction !== null}
                    onClick={() => reveal(request.id)}
                  >
                    {pendingAction === request.id ? <Spinner data-icon="inline-start" /> : null}
                    Reveal & copy
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
