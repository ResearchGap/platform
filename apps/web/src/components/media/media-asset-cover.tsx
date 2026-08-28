"use client";

import { useEffect, useState } from "react";

import { MediaCover } from "@/components/public/media-cover";
import { getMedia } from "@/lib/api/media";

export function MediaAssetCover({
  alt,
  assetId,
  fallbackUrl,
}: {
  alt: string;
  assetId?: string | null;
  fallbackUrl?: string | null;
}) {
  const [url, setUrl] = useState(fallbackUrl ?? null);

  useEffect(() => {
    if (!assetId || fallbackUrl) return;
    let active = true;
    void getMedia(assetId)
      .then((asset) => {
        if (active) setUrl(asset.url);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [assetId, fallbackUrl]);

  return <MediaCover alt={alt} src={url} />;
}
