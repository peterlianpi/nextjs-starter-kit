# Unit 13: Image Crop & Resize

## Goal

Add client-side crop and resize to the upload flow: users pick an image,
crop it interactively, resize via Canvas, then the processed blob is uploaded
through the existing upload service and recorded in `FileUpload`.

## Recommended Library

- `react-easy-crop` **^6.2.3**

**Compat notes:** react-easy-crop v6 supports React 18+; compatible with
React 19. Resize/export uses native Canvas API (`HTMLCanvasElement.toBlob`)
— no extra dependency.

## Files touched

- `features/media/components/image-cropper.tsx` — client component wrapping react-easy-crop's `Cropper` with aspect-ratio + zoom controls
- `features/media/components/upload-with-crop.tsx` — file input → cropper modal → canvas export → upload pipeline
- `features/media/components/media-library.tsx` — grid of existing uploads from `FileUpload` metadata, with re-crop/delete actions
- `features/media/hooks/use-crop.ts` — crop state + `getCroppedBlob(imageSrc, croppedAreaPixels, targetWidth?)` Canvas helper

## Integration points

- Upload executes through `lib/services/upload.ts` abstraction (provider-agnostic; respects `UPLOAD_PROVIDER`). Never call providers directly.
- Metadata row created in `FileUpload` model (url, filename, size, dimensions).
- Editor image insertion (Unit 10) consumes this component: TipTap toolbar's
  image button opens the cropper flow and inserts the returned URL via the
  editor's `onUpload` callback.

## DB impact

- None structurally. Uses existing `FileUpload` model fields.
- Optional seed of a few sample rows for local dev.

## Risks

- Canvas `toBlob` loses EXIF orientation on some images — apply
  `createImageBitmap(blob, { imageOrientation: "from-image" })` or equivalent
  before drawing to avoid rotated results.
- Large source images can freeze the main thread during export — cap input
  dimension (e.g. downscale above 4096px) before cropping.
- HEIC inputs are not decodable by Canvas in most browsers — show a clear
  error for unsupported types (validate type/size first per upload rules).

## Done when

- [ ] File picker → cropper appears with draggable/resizable crop area and zoom slider
- [ ] Aspect ratio presets available (free, 1:1, 16:9)
- [ ] Exported blob reflects exactly the selected crop region at chosen resolution
- [ ] Processed image uploads via `lib/services/upload.ts` and a `FileUpload` record is created with correct metadata
- [ ] Media library lists uploads with thumbnails and delete action
- [ ] Unit 10 editor image button opens this flow and inserts resulting URL
- [ ] EXIF-oriented photos export upright
- [ ] Unsupported types rejected with user-facing validation message
- [ ] Works in light and dark themes; responsive on mobile
- [ ] `bun run lint` and `bun run build` pass

## Size

**M**
