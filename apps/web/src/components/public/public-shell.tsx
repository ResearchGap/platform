import { buttonVariants } from "@platform/ui/components/button";
import { BookOpenText, Menu } from "lucide-react";
import Link from "next/link";

const navigation = [
  { href: "/", label: "Home" },
  { href: "/content", label: "Research Content" },
  { href: "/webinars", label: "Webinar" },
  { href: "/bootcamps", label: "Bootcamp" },
] as const;

function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2 font-semibold tracking-tight">
      <span className="bg-brand-gradient flex size-9 items-center justify-center rounded-lg text-white">
        <BookOpenText className="size-5" aria-hidden="true" />
      </span>
      <span className="text-base">ResearchGap</span>
    </Link>
  );
}

function NavigationLinks({ mobile = false }: { mobile?: boolean }) {
  return navigation.map((item) => (
    <Link
      key={item.href}
      href={item.href}
      className={
        mobile
          ? "rounded-md px-3 py-2 text-sm font-medium hover:bg-muted hover:text-primary"
          : "text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      }
    >
      {item.label}
    </Link>
  ));
}

export function PublicShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-svh flex-col bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/95 backdrop-blur">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <Brand />
          <nav className="hidden items-center gap-7 md:flex" aria-label="Public navigation">
            <NavigationLinks />
          </nav>
          <div className="hidden md:block">
            <Link href="/login" className={buttonVariants({ variant: "brand", size: "lg" })}>
              Log in / Register
            </Link>
          </div>
          <details className="relative md:hidden">
            <summary
              className={buttonVariants({ variant: "outline", size: "icon" })}
              aria-label="Open navigation"
            >
              <Menu aria-hidden="true" />
            </summary>
            <div className="absolute right-0 mt-2 w-64 rounded-xl border bg-card p-3 shadow-lg">
              <nav className="flex flex-col gap-1" aria-label="Mobile navigation">
                <NavigationLinks mobile />
                <Link
                  href="/login"
                  className={buttonVariants({ variant: "brand", className: "mt-2 w-full" })}
                >
                  Log in / Register
                </Link>
              </nav>
            </div>
          </details>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="border-t bg-muted/40">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-4 py-8 text-sm text-muted-foreground sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <Brand />
          <p>Research learning and practical academic programs in one place.</p>
        </div>
      </footer>
    </div>
  );
}
