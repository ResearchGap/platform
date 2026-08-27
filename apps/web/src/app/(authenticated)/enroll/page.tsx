import { buttonVariants } from "@platform/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@platform/ui/components/card";
import { GraduationCap } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { EnrollmentForm } from "@/components/mentee/enrollment-form";
import { PageHeading } from "@/components/public/page-heading";

export const metadata: Metadata = { title: "Enroll in a Bootcamp" };

export default async function EnrollPage({
  searchParams,
}: {
  searchParams: Promise<{ bootcampId?: string }>;
}) {
  const { bootcampId } = await searchParams;

  return (
    <div className="flex max-w-2xl flex-col gap-8">
      <PageHeading
        eyebrow="Bootcamp enrollment"
        title="Enter your enrollment key"
        description="Enrollment validation is completed securely by the ResearchGap backend."
      />
      <Card>
        <CardHeader>
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <GraduationCap aria-hidden="true" />
          </div>
          <CardTitle>Mentee enrollment</CardTitle>
          <CardDescription>
            Keys are Bootcamp-specific and can expire or reach a usage limit.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {bootcampId ? (
            <EnrollmentForm bootcampId={bootcampId} />
          ) : (
            <div className="flex flex-col items-start gap-4">
              <p className="text-sm leading-6 text-muted-foreground">
                Choose a published Bootcamp first so ResearchGap knows where to apply your key.
              </p>
              <Link href="/bootcamps" className={buttonVariants({ variant: "outline" })}>
                Browse Bootcamps
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
