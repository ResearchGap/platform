import type { Metadata } from "next";
import { BootcampForm } from "@/components/mentor/bootcamp-form";
import { PageHeading } from "@/components/public/page-heading";
export const metadata: Metadata = { title: "Create Bootcamp" };
export default function NewBootcampPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeading
        eyebrow="Bootcamps"
        title="Create Bootcamp"
        description="Start a draft, then add sessions before submitting it for operational review."
      />
      <BootcampForm />
    </div>
  );
}
