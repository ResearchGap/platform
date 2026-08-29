"use client";

import { Alert, AlertDescription, AlertTitle } from "@platform/ui/components/alert";
import { Button } from "@platform/ui/components/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@platform/ui/components/field";
import { Input } from "@platform/ui/components/input";
import { Spinner } from "@platform/ui/components/spinner";
import { AlertCircle, Upload } from "lucide-react";
import { useState } from "react";
import { useEffect } from "react";

import { MediaCover } from "@/components/public/media-cover";
import { ApiError } from "@/lib/api/client";
import { getMedia, MAX_MEDIA_BYTES, uploadMedia, type MediaAssetDto } from "@/lib/api/media";

const ACCEPTED_IMAGES = "image/jpeg,image/png,image/webp,image/avif";

export function MediaUploader({
  label = "Image",
  initialAssetId,
  initialUrl,
  onUploaded,
}: {
  initialAssetId?: string | null;
  initialUrl?: string | null;
  label?: string;
  onUploaded: (asset: MediaAssetDto) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [asset, setAsset] = useState<MediaAssetDto | null>(() =>
    initialAssetId && initialUrl
      ? {
          createdAt: "",
          id: initialAssetId,
          mimeType: null,
          originalName: null,
          sourceType: "MANAGED",
          url: initialUrl,
        }
      : null,
  );
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (!initialAssetId || initialUrl) return;
    let active = true;
    void getMedia(initialAssetId)
      .then((resolved) => {
        if (active) setAsset(resolved);
      })
      .catch(() => undefined);
    return () => {
      active = false;
    };
  }, [initialAssetId, initialUrl]);

  return (
    <div className="max-w-xl">
      <FieldGroup>
        {error ? (
          <Alert variant="destructive">
            <AlertCircle aria-hidden="true" />
            <AlertTitle>Upload unsuccessful</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}
        <Field>
          <FieldLabel htmlFor="media-file">{label}</FieldLabel>
          <Input
            id="media-file"
            type="file"
            accept={ACCEPTED_IMAGES}
            disabled={isUploading}
            onChange={(event) => {
              const selectedFile = event.target.files?.[0] ?? null;
              if (selectedFile && selectedFile.size > MAX_MEDIA_BYTES) {
                setFile(null);
                setError("Image must not exceed 2 MB.");
                event.target.value = "";
                return;
              }
              setFile(selectedFile);
              setError(null);
            }}
          />
          <FieldDescription>JPEG, PNG, WebP, or AVIF. Maximum 2 MB.</FieldDescription>
        </Field>
        <Button
          type="button"
          className="self-start"
          disabled={!file || isUploading}
          onClick={async () => {
            if (!file) return;
            setError(null);
            setIsUploading(true);
            try {
              const uploaded = await uploadMedia(file);
              setAsset(uploaded);
              onUploaded(uploaded);
            } catch (requestError) {
              setError(
                requestError instanceof ApiError
                  ? requestError.message
                  : "The image could not be uploaded. Please try again.",
              );
            } finally {
              setIsUploading(false);
            }
          }}
        >
          {isUploading ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <Upload data-icon="inline-start" aria-hidden="true" />
          )}
          {isUploading ? "Uploading…" : "Upload image"}
        </Button>
        {asset ? (
          <div className="overflow-hidden rounded-xl border bg-card">
            <MediaCover src={asset.url} alt={asset.originalName ?? "Uploaded image"} />
            <p className="truncate px-4 py-3 text-sm text-muted-foreground">
              Media asset ID: {asset.id}
            </p>
          </div>
        ) : null}
      </FieldGroup>
    </div>
  );
}
