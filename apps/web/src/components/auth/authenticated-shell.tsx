import { Avatar, AvatarFallback, AvatarImage } from "@platform/ui/components/avatar";
import { buttonVariants } from "@platform/ui/components/button";
import {
  BookOpen,
  BookOpenCheck,
  BookOpenText,
  CalendarDays,
  ClipboardList,
  GraduationCap,
  KeyRound,
  LayoutDashboard,
  ShieldCheck,
  UsersRound,
  Video,
  Menu,
  Newspaper,
  Images,
  UserRound,
} from "lucide-react";
import Link from "next/link";
import type { Route } from "next";

import type { CurrentAccount } from "@/lib/api/mentee-types";

import { AuthenticatedNavigation } from "./authenticated-navigation";
import { LogoutButton } from "./logout-button";

const menteeNavigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/my-bootcamps", label: "My Bootcamps", icon: GraduationCap },
  { href: "/bootcamps", label: "Browse Bootcamps", icon: BookOpen },
  { href: "/content", label: "Research Content", icon: Newspaper },
  { href: "/webinars", label: "Webinars", icon: CalendarDays },
  { href: "/profile", label: "Profile", icon: UserRound },
] as const;

const mentorNavigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/mentor/bootcamps", label: "Bootcamps", icon: BookOpenCheck },
  { href: "/mentor/bootcamps/join", label: "Join Bootcamp", icon: KeyRound },
  { href: "/mentor/content", label: "Research Content", icon: Newspaper },
  { href: "/mentor/webinars", label: "Webinars", icon: CalendarDays },
  { href: "/profile", label: "Profile", icon: UserRound },
] as const;

const superadminNavigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/approvals" as Route, label: "Approvals", icon: ShieldCheck },
  { href: "/admin/users" as Route, label: "Users", icon: UsersRound },
] as const;

const cooNavigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/operations/bootcamps" as Route, label: "Bootcamps", icon: ClipboardList },
  { href: "/operations/webinars" as Route, label: "Webinars", icon: Video },
] as const;

const cmoNavigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/marketing/content" as Route, label: "Research Content", icon: Newspaper },
  { href: "/marketing/visuals" as Route, label: "Program visuals", icon: Images },
] as const;

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
  const navigation = isSuperadmin
    ? superadminNavigation
    : isCoo
      ? cooNavigation
      : isCmo
        ? cmoNavigation
        : isMentor
          ? mentorNavigation
          : menteeNavigation;
  const navigationLabel = `${isSuperadmin ? "Superadmin" : isCoo ? "COO" : isCmo ? "CMO" : isMentor ? "Mentor" : "Mentee"} navigation`;
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
