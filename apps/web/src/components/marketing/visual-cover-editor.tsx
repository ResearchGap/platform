"use client";

import { Button } from "@platform/ui/components/button";
import { Spinner } from "@platform/ui/components/spinner";
import { ImageUp } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

import { MediaUploader } from "@/components/media/media-uploader";
import { ApiError } from "@/lib/api/client";
import { updateBootcampCover, updateWebinarCover } from "@/lib/api/mentor";

export function VisualCoverEditor({
  currentAssetId,
  currentUrl,
  resourceId,
  resourceType,
}: {
  currentAssetId: string | null;
  currentUrl: string | null;
  resourceId: string;
  resourceType: "bootcamp" | "webinar";
}) {
  const router = useRouter();
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(currentAssetId);
  const [pending, setPending] = useState(false);
  const changed = Boolean(selectedAssetId && selectedAssetId !== currentAssetId);

  return (
    <div className="flex max-w-xl flex-col gap-4">
      <MediaUploader
        label={`${resourceType === "bootcamp" ? "Bootcamp" : "Webinar"} cover`}
        initialAssetId={currentAssetId}
        initialUrl={currentUrl}
        onUploaded={(asset) => setSelectedAssetId(asset.id)}
      />
      <Button
        className="self-start"
        disabled={!changed || pending}
        onClick={async () => {
          if (!selectedAssetId) return;
          setPending(true);
          try {
            if (resourceType === "bootcamp") {
              await updateBootcampCover(resourceId, selectedAssetId);
            } else {
              await updateWebinarCover(resourceId, selectedAssetId);
            }
            toast.success("Cover updated");
            router.refresh();
          } catch (error) {
            toast.error(
              error instanceof ApiError ? error.message : "The cover could not be updated.",
            );
            setPending(false);
          }
        }}
      >
        {pending ? (
          <Spinner data-icon="inline-start" />
        ) : (
          <ImageUp data-icon="inline-start" aria-hidden="true" />
        )}
        Apply cover
      </Button>
      <p className="text-xs text-muted-foreground">
        Replacing the relation does not automatically delete the previous MediaAsset.
      </p>
    </div>
  );
}
