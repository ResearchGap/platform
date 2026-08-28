"use client";

import { Alert, AlertDescription, AlertTitle } from "@platform/ui/components/alert";
import { Button } from "@platform/ui/components/button";
import { Spinner } from "@platform/ui/components/spinner";
import { Textarea } from "@platform/ui/components/textarea";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { reviewAccountApproval } from "@/lib/api/admin";
import { ApiError } from "@/lib/api/client";

export function ApprovalReviewActions({ approvalId }: { approvalId: string }) {
  const router = useRouter();
  const [decision, setDecision] = useState<"APPROVE" | "REJECT" | null>(null);
  const [note, setNote] = useState("");
  const [isPending, setIsPending] = useState(false);

  async function submit() {
    if (!decision) return;
    setIsPending(true);
    try {
      await reviewAccountApproval(approvalId, { decision, reviewNote: note.trim() || undefined });
      toast.success(decision === "APPROVE" ? "Account approved" : "Application rejected");
      setDecision(null);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof ApiError ? error.message : "The review could not be completed.");
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-4">
      <label className="grid gap-2 text-sm font-medium">
        Review note <span className="font-normal text-muted-foreground">(optional)</span>
        <Textarea
          value={note}
          maxLength={2000}
          onChange={(event) => setNote(event.target.value)}
          placeholder="Add context for the applicant or future reviewers."
        />
      </label>
      {!decision ? (
        <div className="flex flex-wrap gap-3">
          <Button onClick={() => setDecision("APPROVE")}>Approve account</Button>
          <Button variant="destructive" onClick={() => setDecision("REJECT")}>
            Reject application
          </Button>
        </div>
      ) : (
        <Alert variant={decision === "REJECT" ? "destructive" : "default"}>
          <AlertTitle>Confirm {decision === "APPROVE" ? "approval" : "rejection"}</AlertTitle>
          <AlertDescription>
            This changes the approval record
            {decision === "APPROVE" ? " and activates the applicant account." : "."}
          </AlertDescription>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button
              variant={decision === "REJECT" ? "destructive" : "default"}
              disabled={isPending}
              onClick={submit}
            >
              {isPending && <Spinner data-icon="inline-start" />}Confirm
            </Button>
            <Button variant="outline" disabled={isPending} onClick={() => setDecision(null)}>
              Cancel
            </Button>
          </div>
        </Alert>
      )}
    </div>
  );
}
