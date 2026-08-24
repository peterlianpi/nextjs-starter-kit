import { expect, test } from "@playwright/test";

test.describe("health endpoint", () => {
  test("GET /api/health returns success shape", async ({ request }) => {
    const response = await request.get("/api/health");
    expect(response.ok()).toBeTruthy();

    const body = await response.json();
    expect(body).toMatchObject({
      success: true,
      status: "ok",
    });
    expect(typeof body.timestamp).toBe("string");
    expect(typeof body.uptime).toBe("number");
  });
});
