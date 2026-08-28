import { SessionForm } from "@/components/mentor/session-form";
import { PageHeading } from "@/components/public/page-heading";
export default async function NewSessionPage({
  params,
}: {
  params: Promise<{ bootcampId: string }>;
}) {
  const { bootcampId } = await params;
  return (
    <div className="flex flex-col gap-8">
      <PageHeading
        eyebrow="Bootcamp sessions"
        title="Add session"
        description="Add schedule, venue, speaker, and external learning resources."
      />
      <SessionForm bootcampId={bootcampId} />
    </div>
  );
}
