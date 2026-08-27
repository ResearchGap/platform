import { Badge } from "@platform/ui/components/badge";
import { buttonVariants } from "@platform/ui/components/button";
import { ArrowLeft, CalendarDays } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MediaCover } from "@/components/public/media-cover";
import { PublicErrorState } from "@/components/public/public-states";
import { PublicApiError } from "@/lib/api/client";
import { getPublicContent } from "@/lib/api/public";
import { formatDate, readableLabel } from "@/lib/public-format";

type DetailProps = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: DetailProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const content = await getPublicContent(slug);
    return { title: content.title, description: content.excerpt ?? undefined };
  } catch {
    return { title: "Research Content" };
  }
}

export default async function ContentDetailPage({ params }: DetailProps) {
  const { slug } = await params;
  try {
    const content = await getPublicContent(slug);
    return (
      <article className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
        <Link
          href="/content"
          className={buttonVariants({ variant: "ghost", size: "sm", className: "self-start" })}
        >
          <ArrowLeft data-icon="inline-start" aria-hidden="true" />
          All research content
        </Link>
        <header className="flex flex-col gap-5">
          <div className="flex flex-wrap items-center gap-3">
            <Badge variant="secondary">{readableLabel(content.type)}</Badge>
            {content.publishedAt ? (
              <span className="flex items-center gap-1.5 text-sm text-muted-foreground">
                <CalendarDays className="size-4" aria-hidden="true" />
                {formatDate(content.publishedAt)}
              </span>
            ) : null}
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-balance sm:text-5xl">
            {content.title}
          </h1>
          {content.excerpt ? (
            <p className="text-lg leading-8 text-muted-foreground">{content.excerpt}</p>
          ) : null}
        </header>
        <div className="overflow-hidden rounded-xl border">
          <MediaCover alt={content.title} src={content.cover?.externalUrl} />
        </div>
        <div className="whitespace-pre-wrap text-base leading-8 text-foreground">
          {content.content}
        </div>
      </article>
    );
  } catch (error) {
    if (error instanceof PublicApiError && error.status === 404) {
      notFound();
    }
    return (
      <div className="mx-auto w-full max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <PublicErrorState />
      </div>
    );
  }
}
