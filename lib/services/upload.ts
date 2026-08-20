import * as cloudinary from "./upload-cloudinary";
import * as r2s3 from "./upload-r2-s3";

export type UploadProvider = "cloudinary" | "r2" | "s3" | "local";

export interface UploadResult {
  url: string;
  key: string;
  fileName: string;
  publicId?: string;
  width?: number;
  height?: number;
  bytes?: number;
}

function getProvider(): UploadProvider {
  return (process.env.UPLOAD_PROVIDER as UploadProvider) || "local";
}

export async function uploadFile(
  file: Buffer,
  originalName: string,
  mimeType: string,
  folder?: string,
): Promise<UploadResult> {
  const provider = getProvider();

  switch (provider) {
    case "cloudinary": {
      const result = await cloudinary.uploadFile(file, originalName, mimeType, folder);
      return {
        url: result.secureUrl,
        key: result.publicId,
        fileName: originalName,
        publicId: result.publicId,
        width: result.width,
        height: result.height,
        bytes: result.bytes,
      };
    }

    case "r2":
    case "s3": {
      const result = await r2s3.uploadFile(file, originalName, mimeType, folder);
      return {
        url: result.url,
        key: result.key,
        fileName: result.fileName,
      };
    }

    case "local":
    default: {
      const fs = await import("fs/promises");
      const path = await import("path");
      const { generateFileName } = await import("./file-upload");

      const fileName = generateFileName(originalName);
      const uploadDir = process.env.UPLOAD_DIR || "./public/uploads";
      const filePath = path.join(uploadDir, fileName);

      await fs.mkdir(uploadDir, { recursive: true });
      await fs.writeFile(filePath, file);

      return {
        url: `/uploads/${fileName}`,
        key: fileName,
        fileName,
      };
    }
  }
}

export async function deleteFile(key: string): Promise<void> {
  const provider = getProvider();

  switch (provider) {
    case "cloudinary":
      await cloudinary.deleteFile(key);
      break;

    case "r2":
    case "s3":
      await r2s3.deleteFile(key);
      break;

    case "local":
    default: {
      const fs = await import("fs/promises");
      const path = await import("path");
      const uploadDir = process.env.UPLOAD_DIR || "./public/uploads";
      const filePath = path.join(uploadDir, key);
      await fs.unlink(filePath).catch(() => {});
      break;
    }
  }
}

export { cloudinary, r2s3 };
