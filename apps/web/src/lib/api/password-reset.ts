import { apiRequest } from "./client";

export interface PasswordResetRequestSummary {
  completedAt: string | null;
  deliveryMode: "EMAIL" | "MANUAL";
  effectiveStatus:
    | "REQUESTED"
    | "NO_ACCOUNT"
    | "EMAIL_SENT"
    | "DELIVERY_FAILED"
    | "MANUAL_READY"
    | "COMPLETED"
    | "EXPIRED";
  emailSentAt: string | null;
  expiresAt: string | null;
  id: string;
  manuallyRevealedAt: string | null;
  requestedAt: string;
  requestedBy: { id: string; name: string } | null;
  source: "SELF_SERVICE" | "SUPPORT";
  status:
    | "REQUESTED"
    | "NO_ACCOUNT"
    | "EMAIL_SENT"
    | "DELIVERY_FAILED"
    | "MANUAL_READY"
    | "COMPLETED";
}

export function requestPasswordReset(email: string) {
  return apiRequest<{ message: string }>("/api/password-resets", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email }),
  });
}

export function completePasswordReset(input: {
  newPassword: string;
  requestId: string;
  token: string;
}) {
  return apiRequest<{ status: "completed" }>("/api/password-resets/complete", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(input),
  });
}

export function listPasswordResetRequests(userId: string, init: RequestInit = {}) {
  return apiRequest<{ items: PasswordResetRequestSummary[] }>(
    `/api/admin/users/${userId}/password-reset-requests`,
    { cache: "no-store", ...init },
  );
}

export function createManualPasswordReset(userId: string) {
  return apiRequest<PasswordResetRequestSummary>(
    `/api/admin/users/${userId}/password-reset-requests/manual`,
    { method: "POST" },
  );
}

export function revealPasswordResetLink(requestId: string) {
  return apiRequest<{ url: string }>(
    `/api/admin/password-reset-requests/${requestId}/reveal-link`,
    { method: "POST", cache: "no-store" },
  );
}
