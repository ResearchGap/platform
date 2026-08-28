import { Badge } from "@platform/ui/components/badge";
import { buttonVariants } from "@platform/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@platform/ui/components/card";
import { Pencil } from "lucide-react";
import type { Route } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MediaAssetCover } from "@/components/media/media-asset-cover";
import { ContentOperationalActions } from "@/components/marketing/content-actions";
import { PageHeading } from "@/components/public/page-heading";
import { getManagedContent } from "@/lib/api/mentor";
import { formatDateTime, readableLabel } from "@/lib/public-format";
import { authenticatedRequestInit } from "@/lib/server-auth";

export default async function MarketingContentDetailPage({
  params,
}: {
  params: Promise<{ contentId: string }>;
}) {
  const { contentId } = await params;
  const content = await getManagedContent(contentId, await authenticatedRequestInit()).catch(() =>
    notFound(),
  );
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeading
          eyebrow="Research Content management"
          title={content.title}
          description={content.excerpt || "No excerpt provided."}
        />
        <div className="flex flex-wrap gap-2">
          {content.status !== "ARCHIVED" ? (
            <Link
              href={`/marketing/content/${content.id}/edit` as Route}
              className={buttonVariants({ variant: "outline" })}
            >
              <Pencil data-icon="inline-start" aria-hidden="true" />
              Edit
            </Link>
          ) : null}
          <ContentOperationalActions id={content.id} status={content.status} />
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        <Badge variant="secondary">{readableLabel(content.type)}</Badge>
        <Badge variant="outline">{readableLabel(content.status)}</Badge>
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(18rem,1fr)]">
        <Card>
          <CardHeader>
            <CardTitle>Content body</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="whitespace-pre-wrap text-sm leading-7">{content.content}</p>
          </CardContent>
        </Card>
        <div className="flex flex-col gap-4">
          <Card className="overflow-hidden pt-0">
            <MediaAssetCover
              alt={`${content.title} cover`}
              assetId={content.coverAssetId}
              fallbackUrl={content.cover?.externalUrl}
            />
            <CardHeader>
              <CardTitle className="text-base">Cover presentation</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Publication details</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm text-muted-foreground">
              <p>Author: {content.author.name}</p>
              <p>Updated: {formatDateTime(content.updatedAt)}</p>
              <p>
                Published:{" "}
                {content.publishedAt ? formatDateTime(content.publishedAt) : "Not published"}
              </p>
              {content.publishedBy ? <p>Publisher: {content.publishedBy.name}</p> : null}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
