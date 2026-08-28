import { notFound } from "next/navigation";
import { BootcampForm } from "@/components/mentor/bootcamp-form";
import { PageHeading } from "@/components/public/page-heading";
import { getManagedBootcamp } from "@/lib/api/mentor";
import { authenticatedRequestInit } from "@/lib/server-auth";
export default async function EditBootcampPage({
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
        eyebrow="Bootcamps"
        title="Edit Bootcamp"
        description="Update the draft information before review submission."
      />
      <BootcampForm bootcamp={bootcamp} />
    </div>
  );
}
