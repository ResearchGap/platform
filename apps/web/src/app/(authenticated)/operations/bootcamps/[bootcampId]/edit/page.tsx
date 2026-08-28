import { notFound } from "next/navigation";

import { BootcampForm } from "@/components/mentor/bootcamp-form";
import { PageHeading } from "@/components/public/page-heading";
import { getManagedBootcamp } from "@/lib/api/mentor";
import { authenticatedRequestInit } from "@/lib/server-auth";

export default async function EditOperationsBootcampPage({
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
        eyebrow="Bootcamp operations"
        title="Edit Bootcamp"
        description={`Update ${bootcamp.title} without changing its lifecycle state.`}
      />
      <BootcampForm bootcamp={bootcamp} basePath="/operations/bootcamps" />
    </div>
  );
}
