"use client";

import { Alert, AlertDescription, AlertTitle } from "@platform/ui/components/alert";
import { Button } from "@platform/ui/components/button";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@platform/ui/components/field";
import { Input } from "@platform/ui/components/input";
import { Spinner } from "@platform/ui/components/spinner";
import { AlertCircle, Upload } from "lucide-react";
import { useState } from "react";

import { MediaCover } from "@/components/public/media-cover";
import { ApiError } from "@/lib/api/client";
import { uploadMedia, type MediaAssetDto } from "@/lib/api/media";

const ACCEPTED_IMAGES = "image/jpeg,image/png,image/webp,image/avif";

export function MediaUploader({
  label = "Image",
  onUploaded,
}: {
  label?: string;
  onUploaded: (asset: MediaAssetDto) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [asset, setAsset] = useState<MediaAssetDto | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

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
              setFile(event.target.files?.[0] ?? null);
              setError(null);
            }}
          />
          <FieldDescription>JPEG, PNG, WebP, or AVIF. Maximum 5 MB.</FieldDescription>
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
