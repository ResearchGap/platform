import { PageHeading } from "@/components/public/page-heading";
import { PublicCardGridSkeleton } from "@/components/public/public-states";

export default function PublicLoading() {
  return (
    <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <PageHeading
        eyebrow="ResearchGap"
        title="Loading public information"
        description="We are preparing the latest published resources and programs."
      />
      <PublicCardGridSkeleton />
    </div>
  );
}
