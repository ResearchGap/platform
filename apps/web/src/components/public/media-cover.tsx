import { BookOpenText } from "lucide-react";

import { safeExternalUrl } from "@/lib/public-format";

export function MediaCover({ alt, src }: { alt: string; src?: string | null }) {
  const safeUrl = safeExternalUrl(src);

  return (
    <div className="aspect-video overflow-hidden bg-secondary">
      {safeUrl ? (
        // Provider-independent media URLs are validated by the API and may use any HTTP host.
        // biome-ignore lint/performance/noImgElement: Next Image requires a deployment-specific host allow-list.
        <img
          src={safeUrl}
          alt={alt}
          className="size-full object-cover transition-transform duration-200 group-hover/card:scale-[1.02] motion-reduce:transition-none"
          loading="lazy"
        />
      ) : (
        <div
          className="flex size-full items-center justify-center text-primary/60"
          role="img"
          aria-label="No cover available"
        >
          <BookOpenText className="size-10" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}
