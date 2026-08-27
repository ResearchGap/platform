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
import { ArrowRight, CalendarRange } from "lucide-react";
import Link from "next/link";

import type { PublicBootcampSummary } from "@/lib/api/public-types";
import { formatDate } from "@/lib/public-format";

import { MediaCover } from "./media-cover";

export function BootcampCard({ bootcamp }: { bootcamp: PublicBootcampSummary }) {
  return (
    <Card className="h-full gap-0 py-0">
      <MediaCover alt={bootcamp.title} src={bootcamp.cover?.externalUrl} />
      <CardHeader className="gap-3 pt-5">
        <Badge variant={bootcamp.status === "COMPLETED" ? "outline" : "secondary"}>
          {bootcamp.status === "COMPLETED" ? "Completed" : "Open program"}
        </Badge>
        <CardTitle className="text-lg leading-6">
          <Link href={`/bootcamps/${bootcamp.slug}`} className="hover:text-primary">
            {bootcamp.title}
          </Link>
        </CardTitle>
        <CardDescription className="flex flex-col gap-2 text-sm">
          <span className="flex items-start gap-2">
            <CalendarRange className="mt-0.5 size-4 shrink-0" aria-hidden="true" />
            {formatDate(bootcamp.startDate)} – {formatDate(bootcamp.endDate)}
          </span>
          {bootcamp.whatYouGet ? <span className="line-clamp-2">{bootcamp.whatYouGet}</span> : null}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex-1" />
      <CardFooter className="justify-end bg-muted/30">
        <Link
          href={`/bootcamps/${bootcamp.slug}`}
          className={buttonVariants({ variant: "link", size: "sm" })}
        >
          Explore program
          <ArrowRight data-icon="inline-end" aria-hidden="true" />
        </Link>
      </CardFooter>
    </Card>
  );
}
