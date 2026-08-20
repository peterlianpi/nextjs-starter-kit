import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { generateFileName } from "./file-upload";

export interface UploadResult {
  url: string;
  key: string;
  fileName: string;
}

let s3Client: S3Client | null = null;

function getClient(): S3Client {
  if (s3Client) return s3Client;

  const endpoint = process.env.R2_ENDPOINT || process.env.S3_ENDPOINT;
  const region = process.env.R2_REGION || process.env.S3_REGION || "auto";

  s3Client = new S3Client({
    region,
    endpoint,
    credentials: {
      accessKeyId: process.env.R2_ACCESS_KEY_ID || process.env.S3_ACCESS_KEY_ID || "",
      secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || process.env.S3_SECRET_ACCESS_KEY || "",
    },
  });

  return s3Client;
}

function getBucket(): string {
  return process.env.R2_BUCKET_NAME || process.env.S3_BUCKET_NAME || "";
}

function getPublicUrl(key: string): string {
  const customDomain = process.env.R2_PUBLIC_DOMAIN || process.env.S3_PUBLIC_DOMAIN;
  if (customDomain) return `${customDomain}/${key}`;

  const bucket = getBucket();
  return `https://${bucket}.s3.amazonaws.com/${key}`;
}

export async function uploadFile(
  file: Buffer,
  originalName: string,
  mimeType: string,
  folder?: string,
): Promise<UploadResult> {
  const client = getClient();
  const bucket = getBucket();

  if (!bucket) {
    throw new Error("R2/S3 bucket not configured");
  }

  const fileName = generateFileName(originalName);
  const key = folder ? `${folder}/${fileName}` : fileName;

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: file,
      ContentType: mimeType,
    }),
  );

  return {
    url: getPublicUrl(key),
    key,
    fileName,
  };
}

export async function deleteFile(key: string): Promise<void> {
  const client = getClient();
  const bucket = getBucket();

  if (!bucket) throw new Error("R2/S3 bucket not configured");

  await client.send(
    new DeleteObjectCommand({
      Bucket: bucket,
      Key: key,
    }),
  );
}

export async function getFileUrl(key: string, expiresIn = 3600): Promise<string> {
  const client = getClient();
  const bucket = getBucket();

  if (!bucket) throw new Error("R2/S3 bucket not configured");

  const command = new GetObjectCommand({
    Bucket: bucket,
    Key: key,
  });

  const { getSignedUrl } = await import("@aws-sdk/s3-request-presigner");
  return getSignedUrl(client, command, { expiresIn });
}
