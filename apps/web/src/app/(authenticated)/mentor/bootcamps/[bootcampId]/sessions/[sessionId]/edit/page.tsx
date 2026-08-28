import { notFound } from "next/navigation";
import { SessionForm } from "@/components/mentor/session-form";
import { PageHeading } from "@/components/public/page-heading";
import { getBootcampSession } from "@/lib/api/mentor";
import { authenticatedRequestInit } from "@/lib/server-auth";
export default async function EditSessionPage({
  params,
}: {
  params: Promise<{ bootcampId: string; sessionId: string }>;
}) {
  const { bootcampId, sessionId } = await params;
  const session = await getBootcampSession(
    bootcampId,
    sessionId,
    await authenticatedRequestInit(),
  ).catch(() => notFound());
  return (
    <div className="flex flex-col gap-8">
      <PageHeading
        eyebrow="Bootcamp sessions"
        title="Edit session"
        description="Manage session information and external resources."
      />
      <SessionForm bootcampId={bootcampId} session={session} />
    </div>
  );
}
