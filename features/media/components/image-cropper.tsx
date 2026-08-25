"use client";

import { useState } from "react";
import Cropper from "react-easy-crop";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import type { Area } from "react-easy-crop";

import { useCrop } from "../hooks/use-crop";

const ASPECT_PRESETS: { label: string; value: number | undefined }[] = [
  { label: "Free", value: undefined },
  { label: "1:1", value: 1 },
  { label: "16:9", value: 16 / 9 },
  { label: "4:3", value: 4 / 3 },
];

interface ImageCropperProps {
  imageSrc: string;
  open: boolean;
  onConfirm: (croppedAreaPixels: Area) => void;
  onCancel: () => void;
}

export function ImageCropper({
  imageSrc,
  open,
  onConfirm,
  onCancel,
}: ImageCropperProps) {
  const { crop, zoom, aspect, onCropChange, onZoomChange, setZoom, setAspect } =
    useCrop();
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onCancel()}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>Crop image</DialogTitle>
          <DialogDescription>
            Drag to reposition, use the slider to zoom.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="relative h-72 w-full overflow-hidden rounded-md bg-muted sm:h-96">
            {open && (
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={aspect}
                onCropChange={onCropChange}
                onZoomChange={onZoomChange}
                onCropComplete={(_area, areaPixels) =>
                  setCroppedAreaPixels(areaPixels)
                }
                objectFit="contain"
              />
            )}
          </div>

          <div className="flex items-center gap-2">
            {ASPECT_PRESETS.map((preset) => (
              <Badge
                key={preset.label}
                variant={aspect === preset.value ? "default" : "outline"}
                className="cursor-pointer"
                onClick={() => setAspect(preset.value)}
              >
                {preset.label}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <span className="w-10 text-xs text-muted-foreground">Zoom</span>
            <Slider
              aria-label="Zoom"
              min={1}
              max={3}
              step={0.1}
              value={[zoom]}
              onValueChange={(values) => setZoom(values[0] ?? 1)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button
            disabled={!croppedAreaPixels}
            onClick={() => croppedAreaPixels && onConfirm(croppedAreaPixels)}
          >
            Apply
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
