import { Avatar, AvatarFallback, AvatarImage } from "@platform/ui/components/avatar";
import { buttonVariants } from "@platform/ui/components/button";
import {
  BookOpen,
  BookOpenText,
  CalendarDays,
  GraduationCap,
  LayoutDashboard,
  Menu,
  Newspaper,
  UserRound,
} from "lucide-react";
import Link from "next/link";

import type { CurrentAccount } from "@/lib/api/mentee-types";

import { LogoutButton } from "../auth/logout-button";

const navigation = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
  { href: "/my-bootcamps", label: "My Bootcamps", icon: GraduationCap },
  { href: "/bootcamps", label: "Browse Bootcamps", icon: BookOpen },
  { href: "/content", label: "Research Content", icon: Newspaper },
  { href: "/webinars", label: "Webinars", icon: CalendarDays },
  { href: "/profile", label: "Profile", icon: UserRound },
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

function NavLinks({ mobile = false }: { mobile?: boolean }) {
  return navigation.map(({ href, icon: Icon, label }) => (
    <Link
      key={href}
      href={href}
      className={
        mobile
          ? "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium hover:bg-muted hover:text-primary"
          : "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-primary"
      }
    >
      <Icon aria-hidden="true" />
      {label}
    </Link>
  ));
}

export function MenteeShell({
  account,
  children,
}: {
  account: CurrentAccount;
  children: React.ReactNode;
}) {
  const initials = account.user.name
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();

  return (
    <div className="min-h-svh bg-muted/30">
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
              <nav className="flex flex-col gap-1" aria-label="Mentee navigation">
                <NavLinks mobile />
                <LogoutButton />
              </nav>
            </div>
          </details>
        </div>
      </header>

      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r bg-background px-4 py-6 md:flex">
        <Brand />
        <nav className="mt-8 flex flex-1 flex-col gap-1" aria-label="Mentee navigation">
          <NavLinks />
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

      <main className="md:pl-64">
        <div className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
