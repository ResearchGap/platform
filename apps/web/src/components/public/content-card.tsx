import { Badge } from "@platform/ui/components/badge";
import { buttonVariants } from "@platform/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@platform/ui/components/card";
import { ArrowRight, CalendarDays } from "lucide-react";
import Link from "next/link";

import type { PublicContentSummary } from "@/lib/api/public-types";
import { formatDate, readableLabel } from "@/lib/public-format";

import { MediaCover } from "./media-cover";

export function ContentCard({ content }: { content: PublicContentSummary }) {
  return (
    <Card className="h-full gap-0 py-0">
      <MediaCover alt={content.title} src={content.cover?.externalUrl} />
      <CardHeader className="gap-3 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant="secondary">{readableLabel(content.type)}</Badge>
          {content.publishedAt ? (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <CalendarDays className="size-3.5" aria-hidden="true" />
              {formatDate(content.publishedAt)}
            </span>
          ) : null}
        </div>
        <CardTitle className="text-lg leading-6">
          <Link href={`/content/${content.slug}`} className="hover:text-primary">
            {content.title}
          </Link>
        </CardTitle>
        <CardDescription className="line-clamp-3 text-sm">
          {content.excerpt ?? "Read the latest insight from ResearchGap."}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1" />
      <CardFooter className="justify-end bg-muted/30">
        <Link
          href={`/content/${content.slug}`}
          className={buttonVariants({ variant: "link", size: "sm" })}
        >
          Read content
          <ArrowRight data-icon="inline-end" aria-hidden="true" />
        </Link>
      </CardFooter>
    </Card>
  );
}
