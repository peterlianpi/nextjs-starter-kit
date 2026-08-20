import { v2 as cloudinary } from "cloudinary";
import { UploadApiErrorResponse, UploadApiResponse } from "cloudinary";
import { generateFileName } from "./file-upload";

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

function configureCloudinary() {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

export async function uploadFile(
  file: Buffer,
  originalName: string,
  mimeType: string,
  folder?: string,
): Promise<CloudinaryUploadResult> {
  configureCloudinary();

  const fileName = generateFileName(originalName);

  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        public_id: fileName,
        folder,
        resource_type: mimeType.startsWith("video") ? "video" : "image",
      },
      (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
        if (error || !result) {
          reject(new Error(error?.message || "Upload failed"));
          return;
        }

        resolve({
          url: result.url,
          secureUrl: result.secure_url,
          publicId: result.public_id,
          format: result.format,
          width: result.width,
          height: result.height,
          bytes: result.bytes,
        });
      },
    );

    uploadStream.end(file);
  });
}

export async function deleteFile(publicId: string): Promise<void> {
  configureCloudinary();

  return new Promise((resolve, reject) => {
    cloudinary.uploader.destroy(publicId, (error, result) => {
      if (error || result?.result !== "ok") {
        reject(new Error(error?.message || "Delete failed"));
        return;
      }
      resolve();
    });
  });
}

export function getTransformedUrl(
  publicId: string,
  options: {
    width?: number;
    height?: number;
    crop?: string;
    quality?: string;
    format?: string;
    effect?: string;
  } = {},
): string {
  configureCloudinary();

  return cloudinary.url(publicId, {
    width: options.width,
    height: options.height,
    crop: options.crop || "limit",
    quality: options.quality || "auto",
    fetch_format: options.format || "auto",
    effect: options.effect,
  });
}
