import { notFound } from "next/navigation";
import { ContentForm } from "@/components/mentor/content-form";
import { PageHeading } from "@/components/public/page-heading";
import { getManagedContent } from "@/lib/api/mentor";
import { authenticatedRequestInit } from "@/lib/server-auth";
export default async function EditContentPage({
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
      <PageHeading
        eyebrow="Research Content"
        title="Edit content"
        description={`Status: ${content.status.toLowerCase()}. Available actions remain permission-controlled by the backend.`}
      />
      <ContentForm content={content} />
    </div>
  );
}
