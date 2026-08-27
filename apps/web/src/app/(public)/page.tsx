import { Badge } from "@platform/ui/components/badge";
import { buttonVariants } from "@platform/ui/components/button";
import { ArrowRight, BookOpenCheck, CalendarClock, GraduationCap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { BootcampCard } from "@/components/public/bootcamp-card";
import { ContentCard } from "@/components/public/content-card";
import { PublicEmptyState, PublicErrorState } from "@/components/public/public-states";
import { WebinarCard } from "@/components/public/webinar-card";
import { listPublicBootcamps, listPublicContent, listPublicWebinars } from "@/lib/api/public";

export const metadata: Metadata = {
  title: "Research learning and programs",
};

export default async function HomePage() {
  const [contentResult, webinarResult, bootcampResult] = await Promise.allSettled([
    listPublicContent({ limit: 3 }),
    listPublicWebinars({ filter: "UPCOMING", limit: 3 }),
    listPublicBootcamps({ limit: 3 }),
  ]);

  const contents = contentResult.status === "fulfilled" ? contentResult.value.items : null;
  const webinars = webinarResult.status === "fulfilled" ? webinarResult.value.items : null;
  const bootcamps = bootcampResult.status === "fulfilled" ? bootcampResult.value.items : null;

  return (
    <div className="flex flex-col">
      <section className="border-b bg-muted/35">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-20 lg:grid-cols-[1.2fr_0.8fr] lg:items-center lg:px-8 lg:py-24">
          <div className="flex flex-col items-start gap-6">
            <Badge variant="secondary">Research learning, made practical</Badge>
            <div className="flex max-w-3xl flex-col gap-4">
              <h1 className="text-4xl font-bold tracking-tight text-balance sm:text-5xl lg:text-6xl">
                Close the gap between research ideas and real progress.
              </h1>
              <p className="max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
                Explore published insights, join focused webinars, and discover structured bootcamp
                programs for your research journey.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/bootcamps" className={buttonVariants({ variant: "brand", size: "lg" })}>
                Explore bootcamps
                <ArrowRight data-icon="inline-end" aria-hidden="true" />
              </Link>
              <Link href="/content" className={buttonVariants({ variant: "outline", size: "lg" })}>
                Read research content
              </Link>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-1">
            {[
              {
                icon: BookOpenCheck,
                label: "Published insights",
                text: "News, articles, and announcements",
              },
              {
                icon: CalendarClock,
                label: "External webinars",
                text: "Useful sessions hosted by trusted platforms",
              },
              {
                icon: GraduationCap,
                label: "Focused bootcamps",
                text: "Structured programs with public session overviews",
              },
            ].map(({ icon: Icon, label, text }) => (
              <div key={label} className="flex items-start gap-4 rounded-xl border bg-card p-5">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-secondary text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                <div className="flex flex-col gap-1">
                  <p className="font-semibold">{label}</p>
                  <p className="text-sm leading-6 text-muted-foreground">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <HomeSection
        title="Latest research content"
        description="Fresh perspectives and important updates from the ResearchGap community."
        href="/content"
      >
        {contents === null ? (
          <PublicErrorState />
        ) : contents.length === 0 ? (
          <PublicEmptyState />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {contents.map((content) => (
              <ContentCard key={content.id} content={content} />
            ))}
          </div>
        )}
      </HomeSection>

      <HomeSection
        title="Upcoming webinars"
        description="Discover external sessions and register with the event organizer."
        href="/webinars"
        muted
      >
        {webinars === null ? (
          <PublicErrorState />
        ) : webinars.length === 0 ? (
          <PublicEmptyState />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {webinars.map((webinar) => (
              <WebinarCard key={webinar.id} webinar={webinar} />
            ))}
          </div>
        )}
      </HomeSection>

      <HomeSection
        title="Bootcamp programs"
        description="Browse public program information and planned session outlines."
        href="/bootcamps"
      >
        {bootcamps === null ? (
          <PublicErrorState />
        ) : bootcamps.length === 0 ? (
          <PublicEmptyState />
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {bootcamps.map((bootcamp) => (
              <BootcampCard key={bootcamp.id} bootcamp={bootcamp} />
            ))}
          </div>
        )}
      </HomeSection>
    </div>
  );
}

function HomeSection({
  children,
  description,
  href,
  muted = false,
  title,
}: {
  children: React.ReactNode;
  description: string;
  href: "/bootcamps" | "/content" | "/webinars";
  muted?: boolean;
  title: string;
}) {
  return (
    <section className={muted ? "bg-muted/35" : undefined}>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-14 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex max-w-2xl flex-col gap-2">
            <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
            <p className="text-sm leading-6 text-muted-foreground">{description}</p>
          </div>
          <Link href={href} className={buttonVariants({ variant: "outline" })}>
            View all
            <ArrowRight data-icon="inline-end" aria-hidden="true" />
          </Link>
        </div>
        {children}
      </div>
    </section>
  );
}
