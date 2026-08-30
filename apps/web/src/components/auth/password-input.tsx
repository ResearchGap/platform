"use client";

import {
  PASSWORD_MAX_LENGTH,
  PASSWORD_MIN_LENGTH,
  evaluatePasswordPolicy,
  type PasswordPolicyChecks,
} from "@platform/auth/password-policy";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@platform/ui/components/input-group";
import { cn } from "@platform/ui/lib/utils";
import { Circle, CircleCheck, CircleX, Eye, EyeOff } from "lucide-react";
import { useState, type ComponentProps } from "react";

type PasswordInputProps = Omit<ComponentProps<typeof InputGroupInput>, "type">;

export function PasswordInput({ className, disabled, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <InputGroup className="h-10 rounded-md" data-disabled={disabled || undefined}>
      <InputGroupInput
        {...props}
        className={cn("rounded-md", className)}
        disabled={disabled}
        type={visible ? "text" : "password"}
      />
      <InputGroupAddon align="inline-end">
        <InputGroupButton
          type="button"
          size="icon-sm"
          aria-label={visible ? "Hide password" : "Show password"}
          aria-pressed={visible}
          disabled={disabled}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
        </InputGroupButton>
      </InputGroupAddon>
    </InputGroup>
  );
}

const requirements: Array<{ key: keyof PasswordPolicyChecks; label: string }> = [
  { key: "minLength", label: `At least ${PASSWORD_MIN_LENGTH} characters` },
  { key: "maxLength", label: `Maximum ${PASSWORD_MAX_LENGTH} characters` },
  { key: "uppercase", label: "One uppercase letter" },
  { key: "lowercase", label: "One lowercase letter" },
  { key: "number", label: "One number" },
  { key: "symbol", label: "One symbol" },
];

export function PasswordPolicyFeedback({ password }: { password: string }) {
  const checks = evaluatePasswordPolicy(password);
  const active = password.length > 0;

  return (
    <ul className="grid gap-1 text-xs" aria-label="Password requirements" aria-live="polite">
      {requirements.map(({ key, label }) => {
        const satisfied = checks[key];
        const Icon = !active ? Circle : satisfied ? CircleCheck : CircleX;
        return (
          <li
            key={key}
            className={cn(
              "flex items-center gap-1.5",
              !active && "text-muted-foreground",
              active && satisfied && "text-foreground",
              active && !satisfied && "text-destructive",
            )}
          >
            <Icon aria-hidden="true" className="size-3.5 shrink-0" />
            <span>{label}</span>
          </li>
        );
      })}
    </ul>
  );
}

export function PasswordMatchFeedback({
  confirmation,
  password,
}: {
  confirmation: string;
  password: string;
}) {
  if (!confirmation || confirmation === password) return null;
  return (
    <p className="flex items-center gap-1.5 text-xs text-destructive" aria-live="polite">
      <CircleX aria-hidden="true" className="size-3.5 shrink-0" />
      Passwords do not match.
    </p>
  );
}
