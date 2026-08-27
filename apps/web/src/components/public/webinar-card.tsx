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
import { ArrowRight, CalendarDays, MapPin, UserRound } from "lucide-react";
import Link from "next/link";

import type { PublicWebinarSummary } from "@/lib/api/public-types";
import { formatDateTime, readableLabel } from "@/lib/public-format";

import { MediaCover } from "./media-cover";

export function WebinarCard({ webinar }: { webinar: PublicWebinarSummary }) {
  return (
    <Card className="h-full gap-0 py-0">
      <MediaCover alt={webinar.title} src={webinar.cover?.externalUrl} />
      <CardHeader className="gap-3 pt-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Badge variant={webinar.status === "COMPLETED" ? "outline" : "secondary"}>
            {webinar.status === "COMPLETED" ? "Completed" : readableLabel(webinar.sessionType)}
          </Badge>
        </div>
        <CardTitle className="text-lg leading-6">
          <Link href={`/webinars/${webinar.slug}`} className="hover:text-primary">
            {webinar.title}
          </Link>
        </CardTitle>
        <CardDescription className="flex flex-col gap-2 text-sm">
          <span className="flex items-start gap-2">
            <CalendarDays className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {formatDateTime(webinar.scheduledAt)}
          </span>
          {webinar.speakerName ? (
            <span className="flex items-start gap-2">
              <UserRound className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {webinar.speakerName}
            </span>
          ) : null}
          {webinar.venue ? (
            <span className="flex items-start gap-2">
              <MapPin className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
              {webinar.venue}
            </span>
          ) : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1" />
      <CardFooter className="justify-end bg-muted/30">
        <Link
          href={`/webinars/${webinar.slug}`}
          className={buttonVariants({ variant: "link", size: "sm" })}
        >
          View webinar
          <ArrowRight data-icon="inline-end" aria-hidden="true" />
        </Link>
      </CardFooter>
    </Card>
  );
}
