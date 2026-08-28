import type { Metadata } from "next";
import { MentorJoinForm } from "@/components/mentor/mentor-join-form";
import { PageHeading } from "@/components/public/page-heading";
export const metadata: Metadata = { title: "Join a Bootcamp" };
export default function JoinBootcampPage() {
  return (
    <div className="flex flex-col gap-8">
      <PageHeading
        eyebrow="Mentor assignment"
        title="Join a Bootcamp"
        description="Use a Mentor enrollment key and its Bootcamp ID. The server validates the key, audience, limits, and assignment."
      />
      <MentorJoinForm />
    </div>
  );
}
