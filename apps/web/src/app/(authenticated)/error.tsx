"use client";

import { PublicErrorState } from "@/components/public/public-states";

export default function AuthenticatedError({ reset }: { reset: () => void }) {
  return (
    <PublicErrorState
      title="This account page could not be loaded"
      description="Please retry. If the problem continues, return to the dashboard."
      retry={reset}
    />
  );
}
