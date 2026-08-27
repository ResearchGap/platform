"use client";

import { PublicErrorState } from "@/components/public/public-states";

export default function PublicError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
      <PublicErrorState retry={reset} />
    </div>
  );
}
