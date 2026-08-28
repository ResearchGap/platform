import { Badge } from "@platform/ui/components/badge";
import { notFound } from "next/navigation";

import { VisualCoverEditor } from "@/components/marketing/visual-cover-editor";
import { PageHeading } from "@/components/public/page-heading";
import { getWebinarVisual } from "@/lib/api/mentor";
import { formatDateTime, readableLabel } from "@/lib/public-format";
import { authenticatedRequestInit } from "@/lib/server-auth";

export default async function WebinarVisualDetailPage({
  params,
}: {
  params: Promise<{ webinarId: string }>;
}) {
  const { webinarId } = await params;
  const webinar = await getWebinarVisual(webinarId, await authenticatedRequestInit()).catch(() =>
    notFound(),
  );
  return (
    <div className="flex flex-col gap-8">
      <PageHeading
        eyebrow="Webinar visual"
        title={webinar.title}
        description={formatDateTime(webinar.scheduledAt)}
      />
      <div className="flex flex-wrap gap-2">
        <Badge variant="outline">{readableLabel(webinar.status)}</Badge>
        <Badge variant="secondary">{readableLabel(webinar.sessionType)}</Badge>
      </div>
      <VisualCoverEditor
        resourceId={webinar.id}
        resourceType="webinar"
        currentAssetId={webinar.coverAssetId}
        currentUrl={webinar.cover?.externalUrl ?? null}
      />
    </div>
  );
}
