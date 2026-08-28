import type { Metadata } from "next";

import { WebinarForm } from "@/components/mentor/webinar-form";
import { PageHeading } from "@/components/public/page-heading";

export const metadata: Metadata = { title: "Create Webinar" };

export default function NewOperationsWebinarPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeading
        eyebrow="Webinar operations"
        title="Create Webinar"
        description="Create a draft with schedule, speaker, venue, and external links."
      />
      <WebinarForm basePath="/operations/webinars" />
    </div>
  );
}
