import { buttonVariants } from "@platform/ui/components/button";
import { ArrowRight, BookOpenCheck, CalendarDays } from "lucide-react";
import type { Metadata, Route } from "next";
import Link from "next/link";

import { BootcampVisualCard, WebinarVisualCard } from "@/components/marketing/program-visual-card";
import { PageHeading } from "@/components/public/page-heading";
import { PublicEmptyState, PublicErrorState } from "@/components/public/public-states";
import { listBootcampVisuals, listWebinarVisuals } from "@/lib/api/mentor";
import { authenticatedRequestInit } from "@/lib/server-auth";

export const metadata: Metadata = { title: "Program Visuals" };

export default async function ProgramVisualsPage() {
  const requestInit = await authenticatedRequestInit();
  const result = await Promise.all([
    listBootcampVisuals({ limit: 3 }, requestInit),
    listWebinarVisuals({ limit: 3 }, requestInit),
  ]).catch(() => null);
  if (!result) return <PublicErrorState title="Program visuals could not be loaded" />;
  const [bootcamps, webinars] = result;
  return (
    <div className="flex flex-col gap-10">
      <PageHeading
        eyebrow="CMO workspace"
        title="Program visuals"
        description="Maintain cover presentation without changing operational program information."
      />
      <VisualSection
        title="Bootcamp covers"
        description="Review and replace Bootcamp cover assets."
        href={"/marketing/visuals/bootcamps" as Route}
        icon={BookOpenCheck}
      >
        {bootcamps.items.length === 0 ? (
          <PublicEmptyState title="No Bootcamps available" />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {bootcamps.items.map((item) => (
              <BootcampVisualCard key={item.id} bootcamp={item} />
            ))}
          </div>
        )}
      </VisualSection>
      <VisualSection
        title="Webinar covers"
        description="Review and replace Webinar cover assets."
        href={"/marketing/visuals/webinars" as Route}
        icon={CalendarDays}
      >
        {webinars.items.length === 0 ? (
          <PublicEmptyState title="No Webinars available" />
        ) : (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {webinars.items.map((item) => (
              <WebinarVisualCard key={item.id} webinar={item} />
            ))}
          </div>
        )}
      </VisualSection>
    </div>
  );
}

function VisualSection({
  children,
  description,
  href,
  icon: Icon,
  title,
}: {
  children: React.ReactNode;
  description: string;
  href: Route;
  icon: typeof BookOpenCheck;
  title: string;
}) {
  return (
    <section className="flex flex-col gap-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Icon className="size-5 text-primary" aria-hidden="true" />
            <h2 className="text-xl font-semibold">{title}</h2>
          </div>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
        <Link href={href} className={buttonVariants({ variant: "outline" })}>
          Browse all
          <ArrowRight data-icon="inline-end" aria-hidden="true" />
        </Link>
      </div>
      {children}
    </section>
  );
}
