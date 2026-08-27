import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@platform/ui/components/card";
import { BookOpenText } from "lucide-react";
import Link from "next/link";

export function AuthCard({
  children,
  description,
  title,
}: {
  children: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <main className="flex min-h-svh items-center justify-center bg-muted/40 px-4 py-10">
      <div className="flex w-full max-w-md flex-col gap-6">
        <Link href="/" className="mx-auto flex items-center gap-2 font-semibold tracking-tight">
          <span className="bg-brand-gradient flex size-9 items-center justify-center rounded-lg text-white">
            <BookOpenText aria-hidden="true" />
          </span>
          ResearchGap
        </Link>
        <Card>
          <CardHeader>
            <CardTitle className="text-xl">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </CardHeader>
          <CardContent>{children}</CardContent>
        </Card>
      </div>
    </main>
  );
}
