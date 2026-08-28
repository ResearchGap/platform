import { Badge } from "@platform/ui/components/badge";
import { notFound } from "next/navigation";

import { WebinarOperationalActions } from "@/components/mentor/webinar-actions";
import { WebinarForm } from "@/components/mentor/webinar-form";
import { PageHeading } from "@/components/public/page-heading";
import { getManagedWebinar } from "@/lib/api/mentor";
import { readableLabel } from "@/lib/public-format";
import { authenticatedRequestInit } from "@/lib/server-auth";

export default async function EditOperationsWebinarPage({
  params,
}: {
  params: Promise<{ webinarId: string }>;
}) {
  const { webinarId } = await params;
  const webinar = await getManagedWebinar(webinarId, await authenticatedRequestInit()).catch(() =>
    notFound(),
  );
  const editable = webinar.status === "DRAFT" || webinar.status === "PUBLISHED";
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <PageHeading
          eyebrow="Webinar operations"
          title={webinar.title}
          description="Manage public information and protected external meeting details."
        />
        <WebinarOperationalActions id={webinar.id} status={webinar.status} />
      </div>
      <Badge className="self-start" variant="outline">
        {readableLabel(webinar.status)}
      </Badge>
      {editable ? (
        <WebinarForm webinar={webinar} basePath="/operations/webinars" />
      ) : (
        <p className="text-sm text-muted-foreground">
          Completed and archived Webinars are retained as read-only operational records.
        </p>
      )}
    </div>
  );
}
