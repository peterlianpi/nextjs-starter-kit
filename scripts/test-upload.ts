import "dotenv/config";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

async function main() {
  const endpoint = process.env.R2_ENDPOINT;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  const bucket = process.env.R2_BUCKET_NAME;
  const publicDomain = process.env.R2_PUBLIC_DOMAIN;

  console.log("=== R2 Config ===");
  console.log("Endpoint:", endpoint);
  console.log("Access Key:", accessKeyId ? "(set)" : "(missing)");
  console.log("Secret Key:", secretAccessKey ? "(set)" : "(missing)");
  console.log("Bucket:", bucket);
  console.log("Public Domain:", publicDomain);
  console.log("");

  if (!endpoint || !accessKeyId || !secretAccessKey || !bucket) {
    console.error("Missing R2 config. Check R2_ENDPOINT, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME");
    process.exit(1);
  }

  const client = new S3Client({
    region: "auto",
    endpoint,
    credentials: { accessKeyId, secretAccessKey },
  });

  // Upload a test file
  const testContent = `R2 upload test — ${new Date().toISOString()}`;
  const testKey = `test/upload-test-${Date.now()}.txt`;

  console.log("=== Uploading test file ===");
  console.log("Key:", testKey);

  await client.send(new PutObjectCommand({
    Bucket: bucket,
    Key: testKey,
    Body: Buffer.from(testContent),
    ContentType: "text/plain",
  }));

  console.log("✅ Upload successful!");

  // Get public URL
  const publicUrl = publicDomain ? `${publicDomain}/${testKey}` : `https://${bucket}.s3.amazonaws.com/${testKey}`;
  console.log("Public URL:", publicUrl);

  // Also get a signed URL (private access test)
  const signedUrl = await getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: testKey }), { expiresIn: 3600 });
  console.log("Signed URL:", signedUrl);

  // Verify public access
  console.log("\n=== Verifying public access ===");
  const response = await fetch(publicUrl);
  if (response.ok) {
    const text = await response.text();
    console.log("✅ Public access works! Content:", text);
  } else {
    console.log("⚠️  Public access returned HTTP", response.status, "(CORS or access policy may need configuration)");
  }

  console.log("\n🎉 R2 upload test complete!");
}

main().catch((err) => {
  console.error("❌ FAILED:", err.message);
  process.exit(1);
});
