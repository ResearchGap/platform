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

import type { MyBootcampEnrollment } from "@/lib/api/mentee-types";
import { formatDate, readableLabel } from "@/lib/public-format";

import { MediaCover } from "../public/media-cover";

export function MyBootcampCard({ enrollment }: { enrollment: MyBootcampEnrollment }) {
  const { bootcamp } = enrollment;
  const hasLearningAccess = enrollment.status === "ACTIVE";

  return (
    <Card className="group/card overflow-hidden py-0">
      <MediaCover alt={bootcamp.title} src={bootcamp.cover?.externalUrl} />
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <Badge variant={enrollment.status === "COMPLETED" ? "outline" : "secondary"}>
            {readableLabel(enrollment.status)} enrollment
          </Badge>
          <Badge variant="outline">{readableLabel(bootcamp.status)}</Badge>
        </div>
        <CardTitle className="line-clamp-2 text-lg">{bootcamp.title}</CardTitle>
        <CardDescription className="flex items-center gap-2">
          <CalendarRange className="size-4" aria-hidden="true" />
          {formatDate(bootcamp.startDate)} – {formatDate(bootcamp.endDate)}
        </CardDescription>
      </CardHeader>
      {bootcamp.whatYouGet ? (
        <CardContent>
          <p className="line-clamp-2 text-sm leading-6 text-muted-foreground">
            {bootcamp.whatYouGet}
          </p>
        </CardContent>
      ) : null}
      <CardFooter className="pb-5">
        <Link
          href={hasLearningAccess ? `/my-bootcamps/${bootcamp.id}` : `/bootcamps/${bootcamp.slug}`}
          className={buttonVariants({ variant: "outline", className: "w-full" })}
        >
          {hasLearningAccess ? "Open learning view" : "View Bootcamp"}
          <ArrowRight data-icon="inline-end" aria-hidden="true" />
        </Link>
      </CardFooter>
    </Card>
  );
}
