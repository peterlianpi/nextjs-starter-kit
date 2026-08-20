import { Hono } from "hono";
import { hasApiPermission } from "@/lib/auth/api-helpers";

const app = new Hono()
  // GET /api/check-role - Check if current user is admin
  .get("/", async (c) => {
    try {
      const cookie = c.req.header("cookie");
      const isAdmin = await hasApiPermission(cookie, { resource: "user", actions: ["list"] });
      return c.json({ success: true, isAdmin });
    } catch (error) {
      console.error("[CheckRole] Error:", error);
      return c.json(
        { success: false, isAdmin: false, error: "Failed to check role" },
        500,
      );
    }
  });

export default app;
