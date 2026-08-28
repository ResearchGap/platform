import { Badge } from "@platform/ui/components/badge";
import { notFound } from "next/navigation";

import { VisualCoverEditor } from "@/components/marketing/visual-cover-editor";
import { PageHeading } from "@/components/public/page-heading";
import { getBootcampVisual } from "@/lib/api/mentor";
import { formatDate, readableLabel } from "@/lib/public-format";
import { authenticatedRequestInit } from "@/lib/server-auth";

export default async function BootcampVisualDetailPage({
  params,
}: {
  params: Promise<{ bootcampId: string }>;
}) {
  const { bootcampId } = await params;
  const bootcamp = await getBootcampVisual(bootcampId, await authenticatedRequestInit()).catch(() =>
    notFound(),
  );
  return (
    <div className="flex flex-col gap-8">
      <PageHeading
        eyebrow="Bootcamp visual"
        title={bootcamp.title}
        description={`${formatDate(bootcamp.startDate)} - ${formatDate(bootcamp.endDate)}`}
      />
      <Badge className="self-start" variant="outline">
        {readableLabel(bootcamp.status)}
      </Badge>
      <VisualCoverEditor
        resourceId={bootcamp.id}
        resourceType="bootcamp"
        currentAssetId={bootcamp.coverAssetId}
        currentUrl={bootcamp.cover?.externalUrl ?? null}
      />
    </div>
  );
}
