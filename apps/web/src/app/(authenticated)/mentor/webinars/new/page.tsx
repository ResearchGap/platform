import { WebinarForm } from "@/components/mentor/webinar-form";
import { PageHeading } from "@/components/public/page-heading";
export default function NewWebinarPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeading
        eyebrow="Webinars"
        title="Create Webinar"
        description="Manage the schedule and external registration or meeting information."
      />
      <WebinarForm />
    </div>
  );
}
