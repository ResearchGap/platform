import { Avatar, AvatarFallback, AvatarImage } from "@platform/ui/components/avatar";
import { buttonVariants } from "@platform/ui/components/button";
import { BookOpenText, Menu } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";

import type { CurrentAccount } from "@/lib/api/mentee-types";

import {
  AuthenticatedNavigation,
  type AuthenticatedNavigationItem,
} from "./authenticated-navigation";
import { LogoutButton } from "./logout-button";

const menteeNavigation = [
  { href: "/dashboard", label: "Dashboard", icon: "layout-dashboard" },
  { href: "/my-bootcamps", label: "My Bootcamps", icon: "graduation-cap" },
  { href: "/bootcamps", label: "Browse Bootcamps", icon: "book-open" },
  { href: "/content", label: "Research Content", icon: "newspaper" },
  { href: "/webinars", label: "Webinars", icon: "calendar-days" },
  { href: "/profile", label: "Profile", icon: "user-round" },
] as const satisfies readonly AuthenticatedNavigationItem[];

const mentorNavigation = [
  { href: "/dashboard", label: "Dashboard", icon: "layout-dashboard" },
  { href: "/mentor/bootcamps", label: "Bootcamps", icon: "book-open-check" },
  { href: "/mentor/bootcamps/join", label: "Join Bootcamp", icon: "key-round" },
  { href: "/mentor/content", label: "Research Content", icon: "newspaper" },
  { href: "/mentor/webinars", label: "Webinars", icon: "calendar-days" },
  { href: "/profile", label: "Profile", icon: "user-round" },
] as const satisfies readonly AuthenticatedNavigationItem[];

const superadminNavigation = [
  { href: "/dashboard", label: "Dashboard", icon: "layout-dashboard" },
  { href: "/admin/approvals" as Route, label: "Approvals", icon: "shield-check" },
  { href: "/admin/users" as Route, label: "Users", icon: "users-round" },
] as const satisfies readonly AuthenticatedNavigationItem[];

const cooNavigation = [
  { href: "/dashboard", label: "Dashboard", icon: "layout-dashboard" },
  { href: "/operations/bootcamps" as Route, label: "Bootcamps", icon: "clipboard-list" },
  { href: "/operations/webinars" as Route, label: "Webinars", icon: "video" },
] as const satisfies readonly AuthenticatedNavigationItem[];

const cmoNavigation = [
  { href: "/dashboard", label: "Dashboard", icon: "layout-dashboard" },
  { href: "/marketing/content" as Route, label: "Research Content", icon: "newspaper" },
  { href: "/marketing/visuals" as Route, label: "Program visuals", icon: "images" },
] as const satisfies readonly AuthenticatedNavigationItem[];

const ceoNavigation = [
  { href: "/dashboard", label: "Executive Dashboard", icon: "layout-dashboard" },
  { href: "/bootcamps", label: "Bootcamps", icon: "book-open-check" },
  { href: "/webinars", label: "Webinars", icon: "calendar-days" },
  { href: "/content", label: "Research Content", icon: "newspaper" },
  { href: "/profile", label: "Profile", icon: "user-round" },
] as const satisfies readonly AuthenticatedNavigationItem[];

function Brand() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="bg-brand-gradient flex size-9 items-center justify-center rounded-lg text-white">
        <BookOpenText aria-hidden="true" />
      </span>
      ResearchGap
    </Link>
  );
}

export function AuthenticatedShell({
  account,
  children,
}: {
  account: CurrentAccount;
  children: React.ReactNode;
}) {
  const isMentor = account.access.roleCode === "MENTOR";
  const isSuperadmin = account.access.roleCode === "SUPERADMIN";
  const isCoo = account.access.roleCode === "COO";
  const isCmo = account.access.roleCode === "CMO";
  const isCeo = account.access.roleCode === "CEO";
  const navigation = isSuperadmin
    ? superadminNavigation
    : isCoo
      ? cooNavigation
      : isCmo
        ? cmoNavigation
        : isCeo
          ? ceoNavigation
          : isMentor
            ? mentorNavigation
            : menteeNavigation;
  const navigationLabel = `${isSuperadmin ? "Superadmin" : isCoo ? "COO" : isCmo ? "CMO" : isCeo ? "CEO" : isMentor ? "Mentor" : "Mentee"} navigation`;
  const initials = account.user.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-svh bg-muted/30 md:flex">
      <aside className="sticky top-0 hidden h-svh w-64 shrink-0 flex-col border-r bg-background px-4 py-6 md:flex">
        <Brand />
        <nav className="mt-8 flex flex-1 flex-col gap-1" aria-label={navigationLabel}>
          <AuthenticatedNavigation items={navigation} />
        </nav>
        <div className="flex items-center gap-3 border-t pt-4">
          <Avatar>
            {account.user.image ? <AvatarImage src={account.user.image} alt="" /> : null}
            <AvatarFallback>{initials || "RG"}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{account.user.name}</p>
            <p className="truncate text-xs text-muted-foreground">{account.user.email}</p>
          </div>
          <LogoutButton compact />
        </div>
      </aside>

      <div className="min-w-0 flex-1">
        <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur md:hidden">
          <div className="flex h-16 items-center justify-between px-4">
            <Brand />
            <details className="relative">
              <summary
                className={buttonVariants({ variant: "outline", size: "icon" })}
                aria-label="Open application navigation"
              >
                <Menu aria-hidden="true" />
              </summary>
              <div className="absolute right-0 mt-2 w-72 rounded-xl border bg-card p-3 shadow-lg">
                <nav className="flex flex-col gap-1" aria-label={navigationLabel}>
                  <AuthenticatedNavigation items={navigation} mobile />
                  <LogoutButton />
                </nav>
              </div>
            </details>
          </div>
        </header>

        <main className="min-w-0 px-4 py-8 sm:px-6 lg:px-8 xl:px-10">{children}</main>
      </div>
    </div>
  );
}
