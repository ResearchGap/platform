import { buttonVariants } from "@platform/ui/components/button";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@platform/ui/components/empty";
import { BookX } from "lucide-react";
import Link from "next/link";

export default function AuthenticatedNotFound() {
  return (
    <Empty>
      <EmptyHeader>
        <EmptyMedia variant="icon">
          <BookX aria-hidden="true" />
        </EmptyMedia>
        <EmptyTitle>Learning access not found</EmptyTitle>
        <EmptyDescription>
          The Bootcamp is unavailable or is not part of your active enrollment.
        </EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        <Link href="/my-bootcamps" className={buttonVariants({ variant: "outline" })}>
          Return to My Bootcamps
        </Link>
      </EmptyContent>
    </Empty>
  );
}
