import { Badge } from "@platform/ui/components/badge";

import type { RoleCode } from "@/lib/api/mentee-types";

const rolePresentation: Record<
  RoleCode,
  { label: string; variant: NonNullable<React.ComponentProps<typeof Badge>["variant"]> }
> = {
  MENTEE: { label: "Mentee", variant: "brand" },
  MENTOR: { label: "Mentor", variant: "accent" },
  CEO: { label: "CEO", variant: "info" },
  COO: { label: "COO", variant: "success" },
  CMO: { label: "CMO", variant: "warning" },
  SUPERADMIN: { label: "Superadmin", variant: "destructive" },
};

export function RoleBadge({ role }: { role: RoleCode }) {
  const presentation = rolePresentation[role];
  return <Badge variant={presentation.variant}>{presentation.label}</Badge>;
}
