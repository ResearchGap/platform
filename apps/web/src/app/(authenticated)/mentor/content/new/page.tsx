import { ContentForm } from "@/components/mentor/content-form";
import { PageHeading } from "@/components/public/page-heading";
export default function NewContentPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeading
        eyebrow="Research Content"
        title="Create content draft"
        description="Use the practical plain-text editor to prepare ResearchGap content."
      />
      <ContentForm />
    </div>
  );
}
