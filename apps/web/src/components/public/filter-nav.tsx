import { buttonVariants } from "@platform/ui/components/button";
import { cn } from "@platform/ui/lib/utils";
import type { Route } from "next";
import Link from "next/link";

export function FilterNav({
  label,
  options,
}: {
  label: string;
  options: readonly { active: boolean; href: Route; label: string }[];
}) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label={label}>
      {options.map((option) => (
        <Link
          key={option.label}
          href={option.href}
          className={cn(
            buttonVariants({ variant: option.active ? "default" : "outline", size: "sm" }),
          )}
          aria-current={option.active ? "page" : undefined}
        >
          {option.label}
        </Link>
      ))}
    </nav>
  );
}
