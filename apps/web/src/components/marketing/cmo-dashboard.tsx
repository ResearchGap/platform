import { buttonVariants } from "@platform/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@platform/ui/components/card";
import { ArrowRight, FilePenLine, Images, Megaphone, Newspaper } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { ManagedContentCard } from "@/components/mentor/managed-content-card";
import { PageHeading } from "@/components/public/page-heading";
import { PublicErrorState } from "@/components/public/public-states";
import { listManagedContent } from "@/lib/api/mentor";

export async function CmoDashboard({
  name,
  requestInit,
}: {
  name: string;
  requestInit: RequestInit;
}) {
  const result = await Promise.all([
    listManagedContent({ status: "DRAFT", limit: 6 }, requestInit),
    listManagedContent({ status: "PUBLISHED", limit: 6 }, requestInit),
    listManagedContent({ type: "ANNOUNCEMENT", limit: 6 }, requestInit),
  ]).catch(() => null);

  if (!result) return <PublicErrorState title="Content dashboard could not be loaded" />;
  const [drafts, published, announcements] = result;
  const summary = [
    { label: "Content drafts", value: countLabel(drafts), icon: FilePenLine },
    { label: "Published content", value: countLabel(published), icon: Newspaper },
    { label: "Announcements", value: countLabel(announcements), icon: Megaphone },
  ];
  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeading
          eyebrow="CMO workspace"
          title={`Welcome back${name ? `, ${name}` : ""}`}
          description="Create and publish ResearchGap content, and maintain program visuals."
        />
        <div className="flex flex-wrap gap-2">
          <Link
            href={"/marketing/content/new" as Route}
            className={buttonVariants({ variant: "brand" })}
          >
            Create content
          </Link>
          <Link
            href={"/marketing/visuals" as Route}
            className={buttonVariants({ variant: "outline" })}
          >
            <Images data-icon="inline-start" aria-hidden="true" />
            Program visuals
          </Link>
        </div>
      </div>
      <section className="grid gap-4 sm:grid-cols-3">
        {summary.map(({ icon: Icon, label, value }) => (
          <Card key={label}>
            <CardHeader className="flex-row items-center justify-between gap-3">
              <CardDescription>{label}</CardDescription>
              <Icon className="size-5 text-primary" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-semibold tracking-tight">{value}</p>
            </CardContent>
          </Card>
        ))}
      </section>
      <section className="flex flex-col gap-5">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="text-xl font-semibold">Recently published</h2>
            <p className="text-sm text-muted-foreground">Latest public Research Content.</p>
          </div>
          <Link
            href={"/marketing/content?status=PUBLISHED" as Route}
            className={buttonVariants({ variant: "outline" })}
          >
            View published
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Link>
        </div>
        {published.items.length === 0 ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">No published content yet</CardTitle>
            </CardHeader>
          </Card>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {published.items.map((item) => (
              <ManagedContentCard key={item.id} content={item} basePath="/marketing/content" />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function countLabel(page: { items: unknown[]; nextCursor: string | null }) {
  return `${page.items.length}${page.nextCursor ? "+" : ""}`;
}
