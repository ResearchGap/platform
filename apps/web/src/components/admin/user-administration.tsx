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
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import {
  createPermissionOverride,
  deletePermissionOverride,
  updateAdminAccountStatus,
  updateAdminRole,
} from "@/lib/api/admin";
import type { AdminUserDetail, PermissionEffect } from "@/lib/api/admin-types";
import { ApiError } from "@/lib/api/client";
import type { AccountStatus } from "@/lib/api/mentee-types";
import { formatDateTime } from "@/lib/public-format";

const assignableRoles = ["MENTEE", "MENTOR", "CEO", "COO", "CMO"] as const;
type AssignableRole = (typeof assignableRoles)[number];
type MutableStatus = Exclude<AccountStatus, "PENDING">;

function errorMessage(error: unknown) {
  return error instanceof ApiError ? error.message : "The operation could not be completed.";
}

export function UserAdministration({
  permissions,
  user,
}: {
  permissions: string[];
  user: AdminUserDetail;
}) {
  const protectedAccount = user.access.roleCode === "SUPERADMIN";
  return (
    <div className="grid gap-6 xl:grid-cols-2">
      <AccountStatusAdministration user={user} disabled={protectedAccount} />
      <RoleAdministration user={user} disabled={protectedAccount} />
      <PermissionOverrideAdministration
        user={user}
        permissions={permissions}
        disabled={protectedAccount}
      />
    </div>
  );
}

function AccountStatusAdministration({
  disabled,
  user,
}: {
  disabled: boolean;
  user: AdminUserDetail;
}) {
  const router = useRouter();
  const [nextStatus, setNextStatus] = useState<MutableStatus | null>(null);
  const [isPending, setIsPending] = useState(false);
  const pendingAccount = user.access.accountStatus === "PENDING";

  async function confirm() {
    if (!nextStatus) return;
    setIsPending(true);
    try {
      await updateAdminAccountStatus(user.id, nextStatus);
      toast.success("Account status updated");
      setNextStatus(null);
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
      setIsPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Account status</CardTitle>
        <CardDescription>
          Activate, suspend, or disable application access. Authentication records are not exposed
          or removed.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {disabled ? (
          <p className="text-sm text-muted-foreground">
            Privileged Superadmin accounts remain under the controlled provisioning process.
          </p>
        ) : pendingAccount ? (
          <p className="text-sm text-muted-foreground">
            Use the approval workflow to activate or reject this pending account.
          </p>
        ) : nextStatus ? (
          <Confirmation
            title={`Change status to ${nextStatus}?`}
            description="The authorization layer will enforce this state on subsequent protected requests."
            isPending={isPending}
            onCancel={() => setNextStatus(null)}
            onConfirm={confirm}
            destructive={nextStatus !== "ACTIVE"}
          />
        ) : (
          <div className="flex flex-wrap gap-2">
            {(["ACTIVE", "SUSPENDED", "DISABLED"] as const)
              .filter((status) => status !== user.access.accountStatus)
              .map((status) => (
                <Button
                  key={status}
                  variant={
                    status === "ACTIVE"
                      ? "default"
                      : status === "SUSPENDED"
                        ? "outline"
                        : "destructive"
                  }
                  onClick={() => setNextStatus(status)}
                >
                  {status === "DISABLED" ? "Disable" : status[0] + status.slice(1).toLowerCase()}
                </Button>
              ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function RoleAdministration({ disabled, user }: { disabled: boolean; user: AdminUserDetail }) {
  const router = useRouter();
  const [role, setRole] = useState<AssignableRole>(
    user.access.roleCode === "SUPERADMIN" ? "MENTEE" : user.access.roleCode,
  );
  const [confirming, setConfirming] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const unavailable = disabled || user.access.accountStatus === "PENDING";

  async function confirm() {
    setIsPending(true);
    try {
      await updateAdminRole(user.id, role);
      toast.success("Role and default access profile updated");
      setConfirming(false);
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
      setIsPending(false);
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Role administration</CardTitle>
        <CardDescription>
          Role changes always derive the matching default access profile from centralized
          configuration.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {confirming ? (
          <Confirmation
            title={`Assign ${role}?`}
            description="This replaces the current role and its default access profile. Superadmin cannot be assigned here."
            isPending={isPending}
            onCancel={() => setConfirming(false)}
            onConfirm={confirm}
          />
        ) : (
          <>
            <label className="grid gap-2 text-sm font-medium">
              Role
              <select
                className="h-10 rounded-md border bg-background px-3 font-normal"
                value={role}
                disabled={unavailable}
                onChange={(event) => setRole(event.target.value as AssignableRole)}
              >
                {assignableRoles.map((item) => (
                  <option key={item}>{item}</option>
                ))}
              </select>
            </label>
            <Button
              variant="outline"
              disabled={unavailable || role === user.access.roleCode}
              onClick={() => setConfirming(true)}
            >
              Review role change
            </Button>
            {user.access.accountStatus === "PENDING" ? (
              <p className="text-sm text-muted-foreground">
                Approve the account before changing its assigned role.
              </p>
            ) : null}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function PermissionOverrideAdministration({
  disabled,
  permissions,
  user,
}: {
  disabled: boolean;
  permissions: string[];
  user: AdminUserDetail;
}) {
  const router = useRouter();
  const [permissionKey, setPermissionKey] = useState(permissions[0] ?? "");
  const [effect, setEffect] = useState<PermissionEffect>("ALLOW");
  const [expiresAt, setExpiresAt] = useState("");
  const [reason, setReason] = useState("");
  const [confirming, setConfirming] = useState(false);
  const [revokeId, setRevokeId] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);

  async function addOverride() {
    setIsPending(true);
    try {
      await createPermissionOverride(user.id, {
        effect,
        permissionKey,
        expiresAt: expiresAt ? new Date(expiresAt).toISOString() : undefined,
        reason: reason.trim() || undefined,
      });
      toast.success("Permission override added");
      setConfirming(false);
      setReason("");
      setExpiresAt("");
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
      setIsPending(false);
    }
  }

  async function revoke() {
    if (!revokeId) return;
    setIsPending(true);
    try {
      await deletePermissionOverride(user.id, revokeId);
      toast.success("Permission override revoked");
      setRevokeId(null);
      router.refresh();
    } catch (error) {
      toast.error(errorMessage(error));
      setIsPending(false);
    }
  }

  return (
    <Card className="xl:col-span-2">
      <CardHeader>
        <CardTitle>Permission overrides</CardTitle>
        <CardDescription>
          Overrides affect catalogued capabilities only. Resource scopes continue to come from
          access profiles and relationships.
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-6 xl:grid-cols-[1fr_1.3fr]">
        <div className="space-y-4">
          {confirming ? (
            <Confirmation
              title={`Add ${effect} override?`}
              description={`${permissionKey}${expiresAt ? ` until ${formatDateTime(new Date(expiresAt).toISOString())}` : " without expiry"}.`}
              isPending={isPending}
              onCancel={() => setConfirming(false)}
              onConfirm={addOverride}
              destructive={effect === "DENY"}
            />
          ) : (
            <>
              <label className="grid gap-2 text-sm font-medium">
                Permission
                <select
                  className="h-10 rounded-md border bg-background px-3 font-mono text-xs font-normal"
                  value={permissionKey}
                  disabled={disabled}
                  onChange={(event) => setPermissionKey(event.target.value)}
                >
                  {permissions.map((permission) => (
                    <option key={permission}>{permission}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Effect
                <select
                  className="h-10 rounded-md border bg-background px-3 font-normal"
                  value={effect}
                  disabled={disabled}
                  onChange={(event) => setEffect(event.target.value as PermissionEffect)}
                >
                  <option>ALLOW</option>
                  <option>DENY</option>
                </select>
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Expiry <span className="font-normal text-muted-foreground">(optional)</span>
                <Input
                  type="datetime-local"
                  value={expiresAt}
                  disabled={disabled}
                  onChange={(event) => setExpiresAt(event.target.value)}
                />
              </label>
              <label className="grid gap-2 text-sm font-medium">
                Reason <span className="font-normal text-muted-foreground">(optional)</span>
                <Input
                  value={reason}
                  maxLength={500}
                  disabled={disabled}
                  onChange={(event) => setReason(event.target.value)}
                />
              </label>
              <Button disabled={disabled || !permissionKey} onClick={() => setConfirming(true)}>
                Review override
              </Button>
            </>
          )}
        </div>
        <div className="space-y-3">
          {user.overrides.length === 0 ? (
            <p className="text-sm text-muted-foreground">No permission overrides.</p>
          ) : (
            user.overrides.map((override) => (
              <div key={override.id} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <code className="text-xs font-medium">{override.permissionKey}</code>
                      <Badge variant={override.effect === "ALLOW" ? "success" : "destructive"}>
                        {override.effect}
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      Created by {override.createdBy.name}
                      {override.expiresAt
                        ? ` · expires ${formatDateTime(override.expiresAt)}`
                        : " · no expiry"}
                    </p>
                    {override.reason ? <p className="mt-2 text-sm">{override.reason}</p> : null}
                  </div>
                  {revokeId === override.id ? null : (
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={disabled}
                      onClick={() => setRevokeId(override.id)}
                    >
                      Revoke
                    </Button>
                  )}
                </div>
                {revokeId === override.id ? (
                  <div className="mt-4">
                    <Confirmation
                      title="Revoke this override?"
                      description="The user's access-profile capability will take effect immediately afterward."
                      isPending={isPending}
                      onCancel={() => setRevokeId(null)}
                      onConfirm={revoke}
                      destructive
                    />
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function Confirmation({
  description,
  destructive = false,
  isPending,
  onCancel,
  onConfirm,
  title,
}: {
  description: string;
  destructive?: boolean;
  isPending: boolean;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
}) {
  return (
    <Alert variant={destructive ? "destructive" : "default"}>
      <AlertTitle>{title}</AlertTitle>
      <AlertDescription>{description}</AlertDescription>
      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          variant={destructive ? "destructive" : "default"}
          disabled={isPending}
          onClick={onConfirm}
        >
          {isPending && <Spinner data-icon="inline-start" />}Confirm
        </Button>
        <Button variant="outline" disabled={isPending} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </Alert>
  );
}
