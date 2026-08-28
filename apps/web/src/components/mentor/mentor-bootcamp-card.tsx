import { Badge } from "@platform/ui/components/badge";
import { buttonVariants } from "@platform/ui/components/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@platform/ui/components/card";
import { ArrowRight, CalendarDays } from "lucide-react";
import Link from "next/link";
import type { Route } from "next";

import type { ManagedBootcampSummary } from "@/lib/api/mentor-types";
import { formatDate, readableLabel } from "@/lib/public-format";

export function MentorBootcampCard({
  basePath = "/mentor/bootcamps",
  bootcamp,
}: {
  basePath?: "/mentor/bootcamps" | "/operations/bootcamps";
  bootcamp: ManagedBootcampSummary;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={bootcamp.status === "DRAFT" ? "secondary" : "outline"}>
            {readableLabel(bootcamp.status)}
          </Badge>
        </div>
        <CardTitle className="line-clamp-2">{bootcamp.title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
        <p className="flex items-center gap-2">
          <CalendarDays aria-hidden="true" />
          {formatDate(bootcamp.startDate)} – {formatDate(bootcamp.endDate)}
        </p>
        <p>Created by {bootcamp.createdBy.name}</p>
      </CardContent>
      <CardFooter>
        <Link
          href={`${basePath}/${bootcamp.id}` as Route}
          className={buttonVariants({ variant: "outline", size: "sm" })}
        >
          Manage
          <ArrowRight data-icon="inline-end" aria-hidden="true" />
        </Link>
      </CardFooter>
    </Card>
  );
}
