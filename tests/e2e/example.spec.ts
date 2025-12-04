import { test, expect } from "@playwright/test";

test("homepage has title", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle(/in-seoul/);
});

test("homepage displays welcome message", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByText("Welcome to in-seoul")).toBeVisible();
});
