"use client";

import { useCallback, useRef, useState } from "react";
import type { Area } from "react-easy-crop";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Loader2, Upload } from "lucide-react";

import {
  getCroppedBlob,
  readFileAsDataUrl,
  validateImageFile,
} from "../hooks/use-crop";
import { ImageCropper } from "./image-cropper";

export interface UploadedFileRecord {
  id: string;
  originalName: string;
  fileName?: string;
  mimeType?: string;
  fileSize?: number;
  url: string;
  storageType?: string;
  isPublic?: boolean;
  createdAt?: string;
}

interface UploadWithCropProps {
  /** Called with the uploaded record after crop + resize + POST complete. */
  onUploaded?: (record: UploadedFileRecord) => void;
  /** Externally provided file (e.g. from a dropzone). When set, the cropper opens. */
  externalFile?: File | null;
  /** Parent clears this after handling to close the cropper. */
  onExternalFileConsumed?: () => void;
  triggerLabel?: string;
  disabled?: boolean;
}

/**
 * Full image upload pipeline: file select → crop modal → Canvas resize
 * (max 1920px longest side, JPEG q0.85) → POST /api/upload.
 */
export function UploadWithCrop({
  onUploaded,
  externalFile,
  onExternalFileConsumed,
  triggerLabel = "Upload image",
  disabled,
}: UploadWithCropProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const openCropper = useCallback(async (file: File) => {
    const error = validateImageFile(file);
    if (error) {
      toast.error(error);
      return;
    }
    setSelectedFile(file);
    setImageSrc(await readFileAsDataUrl(file));
  }, []);

  // Handle externally provided files (dropzone / editor).
  const consumedRef = useRef(false);
  if (externalFile && !consumedRef.current) {
    consumedRef.current = true;
    void openCropper(externalFile);
  }
  if (!externalFile && consumedRef.current) {
    consumedRef.current = false;
  }

  const handleConfirm = async (croppedAreaPixels: Area) => {
    if (!selectedFile || !imageSrc) return;
    setUploading(true);
    try {
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels);
      const formData = new FormData();
      formData.append("file", blob, selectedFile.name.replace(/\.[^.]+$/, "") + ".jpg");

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const payload = (await res.json()) as {
        success: boolean;
        data?: UploadedFileRecord;
        error?: { message: string };
      };
      if (!res.ok || !payload.success || !payload.data) {
        throw new Error(payload.error?.message ?? "Upload failed");
      }
      toast.success("Image uploaded");
      onUploaded?.(payload.data);
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to process image",
      );
    } finally {
      setUploading(false);
      setImageSrc(null);
      setSelectedFile(null);
      onExternalFileConsumed?.();
    }
  };

  const handleCancel = () => {
    setImageSrc(null);
    setSelectedFile(null);
    onExternalFileConsumed?.();
  };

  return (
    <>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void openCropper(file);
          e.target.value = "";
        }}
      />
      <Button
        type="button"
        variant="outline"
        onClick={() => inputRef.current?.click()}
        disabled={disabled || uploading}
      >
        {uploading ? (
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        ) : (
          <Upload className="mr-2 h-4 w-4" />
        )}
        {triggerLabel}
      </Button>

      <ImageCropper
        imageSrc={imageSrc ?? ""}
        open={!!imageSrc}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
      />
    </>
  );
}
