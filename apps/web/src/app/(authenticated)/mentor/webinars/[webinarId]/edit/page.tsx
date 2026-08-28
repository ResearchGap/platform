import { notFound } from "next/navigation";
import { WebinarForm } from "@/components/mentor/webinar-form";
import { PageHeading } from "@/components/public/page-heading";
import { getManagedWebinar } from "@/lib/api/mentor";
import { authenticatedRequestInit } from "@/lib/server-auth";
export default async function EditWebinarPage({
  params,
}: {
  params: Promise<{ webinarId: string }>;
}) {
  const { webinarId } = await params;
  const webinar = await getManagedWebinar(webinarId, await authenticatedRequestInit()).catch(() =>
    notFound(),
  );
  return (
    <div className="flex flex-col gap-8">
      <PageHeading
        eyebrow="Webinars"
        title="Edit Webinar"
        description={`Status: ${webinar.status.toLowerCase()}. Publication remains permission-controlled.`}
      />
      <WebinarForm webinar={webinar} />
    </div>
  );
}
