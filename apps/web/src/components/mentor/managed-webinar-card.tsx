import { Badge } from "@platform/ui/components/badge";
import { buttonVariants } from "@platform/ui/components/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@platform/ui/components/card";
import { CalendarDays, Pencil } from "lucide-react";
import Link from "next/link";

import type { ManagedWebinarSummary } from "@/lib/api/mentor-types";
import { formatDateTime, readableLabel } from "@/lib/public-format";

export function ManagedWebinarCard({ webinar }: { webinar: ManagedWebinarSummary }) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{readableLabel(webinar.sessionType)}</Badge>
          <Badge variant="outline">{readableLabel(webinar.status)}</Badge>
        </div>
        <CardTitle className="line-clamp-2">{webinar.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <CalendarDays aria-hidden="true" />
          {formatDateTime(webinar.scheduledAt)}
        </p>
        <p>{webinar.speakerName || "Speaker to be confirmed"}</p>
      </CardContent>
      <CardFooter>
        <Link
          href={`/mentor/webinars/${webinar.id}/edit`}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          <Pencil data-icon="inline-start" aria-hidden="true" />
          Edit
        </Link>
      </CardFooter>
    </Card>
  );
}
