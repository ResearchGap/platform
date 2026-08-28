import { notFound } from "next/navigation";

import { SessionForm } from "@/components/mentor/session-form";
import { PageHeading } from "@/components/public/page-heading";
import { getManagedBootcamp } from "@/lib/api/mentor";
import { authenticatedRequestInit } from "@/lib/server-auth";

export default async function NewOperationsSessionPage({
  params,
}: {
  params: Promise<{ bootcampId: string }>;
}) {
  const { bootcampId } = await params;
  const bootcamp = await getManagedBootcamp(bootcampId, await authenticatedRequestInit()).catch(
    () => notFound(),
  );
  return (
    <div className="flex flex-col gap-8">
      <PageHeading
        eyebrow="Bootcamp session"
        title="Add session"
        description={`Add an ordered session to ${bootcamp.title}.`}
      />
      <SessionForm bootcampId={bootcampId} basePath="/operations/bootcamps" />
    </div>
  );
}
