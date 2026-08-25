"use client";

import { useCallback, useState } from "react";
import type { Area } from "react-easy-crop";

export const MAX_IMAGE_DIMENSION = 1920;
export const JPEG_QUALITY = 0.85;

const ACCEPTED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

export interface CropState {
  crop: { x: number; y: number };
  zoom: number;
  aspect: number | undefined;
}

/**
 * Validate an image before running it through the crop pipeline.
 * Returns an error message, or null if valid.
 */
export function validateImageFile(file: File): string | null {
  if (!ACCEPTED_TYPES.includes(file.type)) {
    return "Unsupported file type. Please choose a JPEG, PNG, WebP or GIF image.";
  }
  if (file.size > MAX_FILE_SIZE) {
    return "File is too large. Maximum size is 50MB.";
  }
  return null;
}

/** Read a File/Blob into a data URL usable by react-easy-crop. */
export function readFileAsDataUrl(file: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Failed to read file"));
    reader.readAsDataURL(file);
  });
}

/**
 * Export exactly the selected crop region via Canvas, downscaling to
 * `maxDimension` on the longest side and encoding as JPEG at fixed quality.
 *
 * Uses `createImageBitmap(..., { imageOrientation: "from-image" })` so EXIF-
 * oriented photos export upright.
 */
export async function getCroppedBlob(
  imageSrc: string,
  croppedAreaPixels: Area,
  maxDimension: number = MAX_IMAGE_DIMENSION,
  quality: number = JPEG_QUALITY,
): Promise<Blob> {
  const response = await fetch(imageSrc);
  const blob = await response.blob();

  // GIFs cannot be re-encoded losslessly via canvas — pass the original through.
  if (blob.type === "image/gif") {
    return blob;
  }

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(blob, {
      imageOrientation: "from-image",
    });
  } catch {
    throw new Error(
      "This image format could not be decoded by the browser (HEIC is not supported).",
    );
  }

  const { width: cropX, height: cropY, x, y } = croppedAreaPixels;

  // Downscale the crop output so the longest side never exceeds maxDimension.
  const scale = Math.min(1, maxDimension / Math.max(cropX, cropY));
  const outWidth = Math.max(1, Math.round(cropX * scale));
  const outHeight = Math.max(1, Math.round(cropY * scale));

  const canvas = document.createElement("canvas");
  canvas.width = outWidth;
  canvas.height = outHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported in this browser");

  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(bitmap, x, y, cropX, cropY, 0, 0, outWidth, outHeight);
  bitmap.close();

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (out) => (out ? resolve(out) : reject(new Error("Failed to encode image"))),
      "image/jpeg",
      quality,
    );
  });
}

/** Shared crop UI state (position, zoom, aspect preset). */
export function useCrop(initialAspect?: number) {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [aspect, setAspect] = useState<number | undefined>(initialAspect);

  const onCropChange = useCallback((next: { x: number; y: number }) => {
    setCrop(next);
  }, []);

  const onZoomChange = useCallback((next: number) => {
    setZoom(next);
  }, []);

  const reset = useCallback(() => {
    setCrop({ x: 0, y: 0 });
    setZoom(1);
  }, []);

  return { crop, zoom, aspect, onCropChange, onZoomChange, setZoom, setAspect, reset };
}

export type { Area };
