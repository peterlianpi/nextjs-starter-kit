import { Hono } from "hono";
import prisma from "@/lib/prisma";
import { uploadFile, deleteFile } from "@/lib/services/upload";
import { validateFile } from "@/lib/services/file-upload";
import { getApiSession, hasApiPermission } from "@/lib/auth/api-helpers";

const upload = new Hono()

  // POST /api/upload - Upload a file (multipart form)
  .post("/", async (c) => {
    const cookie = c.req.header("cookie");
    const canUpload = await hasApiPermission(cookie, { resource: "upload", actions: ["create"] });

    if (!canUpload) {
      return c.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Permission denied: upload:create" } },
        401,
      );
    }

    const session = await getApiSession(cookie);

    try {
      const formData = await c.req.formData();
      const file = formData.get("file") as File;

      if (!file) {
        return c.json(
          { success: false, error: { code: "BAD_REQUEST", message: "No file provided" } },
          400,
        );
      }

      const validation = validateFile(file);
      if (!validation.valid) {
        return c.json(
          { success: false, error: { code: "BAD_REQUEST", message: validation.error } },
          400,
        );
      }

      const buffer = Buffer.from(await file.arrayBuffer());
      const result = await uploadFile(buffer, file.name, file.type);

      const fileRecord = await prisma.fileUpload.create({
        data: {
          originalName: file.name,
          fileName: result.fileName,
          mimeType: file.type,
          fileSize: file.size,
          storagePath: result.key,
          storageType: process.env.UPLOAD_PROVIDER || "local",
          url: result.url,
          userId: session!.user.id,
        },
      });

      return c.json({ success: true, data: fileRecord });
    } catch (error) {
      console.error("Upload error:", error);
      return c.json(
        { success: false, error: { code: "INTERNAL_ERROR", message: "Upload failed" } },
        500,
      );
    }
  })

  // GET /api/upload - List user's files
  .get("/", async (c) => {
    const cookie = c.req.header("cookie");
    const canList = await hasApiPermission(cookie, { resource: "upload", actions: ["list"] });

    if (!canList) {
      return c.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Permission denied: upload:list" } },
        401,
      );
    }

    const session = await getApiSession(cookie);

    const files = await prisma.fileUpload.findMany({
      where: {
        OR: [
          { userId: session!.user.id },
          { isPublic: true },
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return c.json({ success: true, data: files });
  })

  // DELETE /api/upload/:id - Delete a file
  .delete("/:id", async (c) => {
    const cookie = c.req.header("cookie");
    const session = await getApiSession(cookie);

    if (!session?.user) {
      return c.json(
        { success: false, error: { code: "UNAUTHORIZED", message: "Authentication required" } },
        401,
      );
    }

    const id = c.req.param("id");

    const file = await prisma.fileUpload.findUnique({ where: { id } });

    if (!file) {
      return c.json(
        { success: false, error: { code: "NOT_FOUND", message: "File not found" } },
        404,
      );
    }

    // Owner can always delete their own files
    const isOwner = file.userId === session.user.id;
    const canDeleteAny = await hasApiPermission(cookie, { resource: "upload", actions: ["delete"] });

    if (!isOwner && !canDeleteAny) {
      return c.json(
        { success: false, error: { code: "FORBIDDEN", message: "Not authorized to delete this file" } },
        403,
      );
    }

    try {
      await deleteFile(file.storagePath);
    } catch {
      // Continue even if storage delete fails
    }

    await prisma.fileUpload.delete({ where: { id } });

    return c.json({ success: true });
  });

export default upload;
