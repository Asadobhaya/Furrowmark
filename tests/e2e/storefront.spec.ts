import { test, expect } from "@playwright/test";

test.describe("Furrowmark Core End-to-End User Journeys", () => {
  test("Catalog & Navigation: customer can browse products and view details", async ({
    page,
  }) => {
    await page.goto("/products");
    await expect(page).toHaveTitle(/Furrowmark/);

    // Verify products heading
    const heading = page.locator("h1");
    await expect(heading).toBeVisible();

    // Verify footer statutory policy links are present
    await expect(page.locator("a[href='/privacy']")).toBeVisible();
    await expect(page.locator("a[href='/terms']")).toBeVisible();
    await expect(page.locator("a[href='/shipping-policy']")).toBeVisible();
    await expect(page.locator("a[href='/return-policy']")).toBeVisible();
  });

  test("Statutory Policies: verify privacy, terms, shipping, and return policies render", async ({
    page,
  }) => {
    // 1. Privacy Policy
    await page.goto("/privacy");
    await expect(page.locator("h1")).toContainText(
      "Privacy & Data Protection Policy",
    );

    // 2. Terms of Service
    await page.goto("/terms");
    await expect(page.locator("h1")).toContainText("Terms of Service");

    // 3. Shipping Policy
    await page.goto("/shipping-policy");
    await expect(page.locator("h1")).toContainText(
      "Shipping & Fulfilment Policy",
    );

    // 4. Return Policy
    await page.goto("/return-policy");
    await expect(page.locator("h1")).toContainText("Return & RMA Policy");
  });

  test("Shopping Cart & Checkout Flow: customer can access cart and review payment options", async ({
    page,
  }) => {
    await page.goto("/cart");
    await expect(page.locator("h1")).toContainText("Your Cart");

    await page.goto("/checkout");
    await expect(page.locator("h1")).toContainText("Checkout");

    // Verify payment instructions for Advance Payment and COD
    await expect(page.locator("body")).toContainText("Advance payment");
    await expect(page.locator("body")).toContainText("Cash on Delivery (COD)");
    await expect(page.locator("body")).toContainText("Muhammad Asad");
    await expect(page.locator("body")).toContainText("03130115156301");
    await expect(page.locator("body")).toContainText("03004634494");
  });

  test("Staff Authentication & Operational Portal Access", async ({ page }) => {
    await page.goto("/staff/login");
    await expect(page.locator("h1")).toContainText("Staff Portal Sign In");

    // Attempting unauthenticated access to staff areas redirects to login
    await page.goto("/staff/orders");
    await expect(page).toHaveURL(/\/staff\/login/);

    await page.goto("/staff/fulfilment");
    await expect(page).toHaveURL(/\/staff\/login/);

    await page.goto("/staff/returns");
    await expect(page).toHaveURL(/\/staff\/login/);

    await page.goto("/staff/reports");
    await expect(page).toHaveURL(/\/staff\/login/);
  });
});
