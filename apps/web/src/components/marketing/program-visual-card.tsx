import { Badge } from "@platform/ui/components/badge";
import { buttonVariants } from "@platform/ui/components/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@platform/ui/components/card";
import { ImageUp } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import { MediaAssetCover } from "@/components/media/media-asset-cover";
import type { BootcampVisualSummary, WebinarVisualSummary } from "@/lib/api/mentor-types";
import { formatDate, formatDateTime, readableLabel } from "@/lib/public-format";

export function BootcampVisualCard({ bootcamp }: { bootcamp: BootcampVisualSummary }) {
  return (
    <Card className="group/card overflow-hidden pt-0">
      <MediaAssetCover
        alt=""
        assetId={bootcamp.coverAssetId}
        fallbackUrl={bootcamp.cover?.externalUrl}
      />
      <CardHeader>
        <Badge variant="outline" className="self-start">
          {readableLabel(bootcamp.status)}
        </Badge>
        <CardTitle className="line-clamp-2">{bootcamp.title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {formatDate(bootcamp.startDate)} - {formatDate(bootcamp.endDate)}
      </CardContent>
      <CardFooter>
        <Link
          href={`/marketing/visuals/bootcamps/${bootcamp.id}` as Route}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <ImageUp data-icon="inline-start" aria-hidden="true" />
          Manage cover
        </Link>
      </CardFooter>
    </Card>
  );
}

export function WebinarVisualCard({ webinar }: { webinar: WebinarVisualSummary }) {
  return (
    <Card className="group/card overflow-hidden pt-0">
      <MediaAssetCover
        alt=""
        assetId={webinar.coverAssetId}
        fallbackUrl={webinar.cover?.externalUrl}
      />
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline">{readableLabel(webinar.status)}</Badge>
          <Badge variant="secondary">{readableLabel(webinar.sessionType)}</Badge>
        </div>
        <CardTitle className="line-clamp-2">{webinar.title}</CardTitle>
      </CardHeader>
      <CardContent className="text-sm text-muted-foreground">
        {formatDateTime(webinar.scheduledAt)}
      </CardContent>
      <CardFooter>
        <Link
          href={`/marketing/visuals/webinars/${webinar.id}` as Route}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <ImageUp data-icon="inline-start" aria-hidden="true" />
          Manage cover
        </Link>
      </CardFooter>
    </Card>
  );
}
