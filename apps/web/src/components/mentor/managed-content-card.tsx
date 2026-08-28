import { Badge } from "@platform/ui/components/badge";
import { buttonVariants } from "@platform/ui/components/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@platform/ui/components/card";
import { Pencil } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";

import type { ManagedContentSummary } from "@/lib/api/mentor-types";
import { formatDate, readableLabel } from "@/lib/public-format";

export function ManagedContentCard({
  basePath = "/mentor/content",
  content,
}: {
  basePath?: "/mentor/content" | "/marketing/content";
  content: ManagedContentSummary;
}) {
  const href =
    basePath === "/marketing/content"
      ? `${basePath}/${content.id}`
      : `${basePath}/${content.id}/edit`;
  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap gap-2">
          <Badge variant="secondary">{readableLabel(content.type)}</Badge>
          <Badge variant="outline">{readableLabel(content.status)}</Badge>
        </div>
        <CardTitle className="line-clamp-2">{content.title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="line-clamp-2 text-sm text-muted-foreground">
          {content.excerpt || `Last updated ${formatDate(content.updatedAt)}`}
        </p>
      </CardContent>
      <CardFooter>
        <Link href={href as Route} className={buttonVariants({ variant: "outline", size: "sm" })}>
          <Pencil data-icon="inline-start" aria-hidden="true" />
          {basePath === "/marketing/content" ? "Manage" : "Edit"}
        </Link>
      </CardFooter>
    </Card>
  );
}
