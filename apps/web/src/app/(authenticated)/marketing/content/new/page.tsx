import type { Metadata } from "next";

import { ContentForm } from "@/components/mentor/content-form";
import { PageHeading } from "@/components/public/page-heading";

export const metadata: Metadata = { title: "Create Research Content" };

export default function NewMarketingContentPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeading
        eyebrow="Research Content"
        title="Create content draft"
        description="Prepare a news item, article, or announcement using the MVP plain-text editor."
      />
      <ContentForm allowCover basePath="/marketing/content" destination="detail" />
    </div>
  );
}
