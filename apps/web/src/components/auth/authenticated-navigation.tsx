"use client";

import { cn } from "@platform/ui/lib/utils";
import {
  BookOpen,
  BookOpenCheck,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  Images,
  KeyRound,
  LayoutDashboard,
  Newspaper,
  ShieldCheck,
  UserRound,
  UsersRound,
  Video,
} from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navigationIcons = {
  "book-open": BookOpen,
  "book-open-check": BookOpenCheck,
  "calendar-days": CalendarDays,
  "clipboard-list": ClipboardList,
  "graduation-cap": GraduationCap,
  images: Images,
  "key-round": KeyRound,
  "layout-dashboard": LayoutDashboard,
  newspaper: Newspaper,
  "shield-check": ShieldCheck,
  "user-round": UserRound,
  "users-round": UsersRound,
  video: Video,
} as const;

export type AuthenticatedNavigationIcon = keyof typeof navigationIcons;

export interface AuthenticatedNavigationItem {
  href: Route;
  icon: AuthenticatedNavigationIcon;
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

  return items.map(({ href, icon, label }) => {
    const isActive = isCurrentRoute(pathname, href);
    const Icon = navigationIcons[icon];

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
