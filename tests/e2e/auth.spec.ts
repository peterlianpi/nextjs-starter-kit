import { expect, test } from "@playwright/test";

test.describe("auth guards", () => {
  test("unauthenticated /dashboard redirects to /login", async ({ page }) => {
    await page.goto("/dashboard");

    // The (protected) route group performs a server-side session check.
    // Unauthenticated visitors must land on the login page.
    await expect(page).toHaveURL(/\/login/);
  });

  test("login page renders", async ({ page }) => {
    await page.goto("/login");

    // The login form should be visible (email + password inputs).
    await expect(page.locator('input[type="email"], input[name="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"], input[name="password"]')).toBeVisible();
  });
});
