import type { Metadata } from "next";

import { BootcampForm } from "@/components/mentor/bootcamp-form";
import { PageHeading } from "@/components/public/page-heading";

export const metadata: Metadata = { title: "Create Bootcamp" };

export default function NewOperationsBootcampPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeading
        eyebrow="Bootcamp operations"
        title="Create Bootcamp"
        description="Create a draft program for operational preparation and review."
      />
      <BootcampForm basePath="/operations/bootcamps" />
    </div>
  );
}
