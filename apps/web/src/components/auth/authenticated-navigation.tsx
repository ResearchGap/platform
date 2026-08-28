"use client";

import { cn } from "@platform/ui/lib/utils";
import type { LucideIcon } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

export interface AuthenticatedNavigationItem {
  href: Route;
  icon: LucideIcon;
  label: string;
}

function isCurrentRoute(pathname: string, href: Route) {
  return pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));
}

export function AuthenticatedNavigation({
  items,
  mobile = false,
}: {
  items: readonly AuthenticatedNavigationItem[];
  mobile?: boolean;
}) {
  const pathname = usePathname();

  return items.map(({ href, icon: Icon, label }) => {
    const isActive = isCurrentRoute(pathname, href);

    return (
      <Link
        key={href}
        href={href}
        aria-current={isActive ? "page" : undefined}
        className={cn(
          "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          mobile ? null : "text-muted-foreground",
          isActive ? "bg-secondary text-secondary-foreground" : "hover:bg-muted hover:text-primary",
        )}
      >
        <Icon aria-hidden="true" />
        {label}
      </Link>
    );
  });
}
