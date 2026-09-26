import { test, expect } from "@playwright/test";

const SEEKER = { email: "seeker@swiito.test", password: "Swiito@123" };

test.describe("Privacy: owner contact data not leaked in public pages", () => {
  const SENSITIVE_PATTERNS = [
    "property_owner_contact",
    "owner_asking_price",
    "full_address",
    "internal_notes",
    "alt_phone",
  ];

  async function assertNoOwnerData(html: string) {
    for (const pattern of SENSITIVE_PATTERNS) {
      expect(html, `"${pattern}" found in page HTML`).not.toContain(pattern);
    }
  }

  test("home page (guest): no owner contact fields in HTML", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const html = await page.content();
    await assertNoOwnerData(html);
  });

  test("home page (signed-in seeker): no owner contact fields in HTML", async ({
    page,
  }) => {
    await page.goto("/sign-in");
    await page.locator('input[type="email"]').fill(SEEKER.email);
    await page.locator('input[type="password"]').fill(SEEKER.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL((url) => !url.pathname.startsWith("/sign-in"), {
      timeout: 10_000,
    });

    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const html = await page.content();
    await assertNoOwnerData(html);
  });

  test("properties page (guest): no owner contact fields in HTML", async ({
    page,
  }) => {
    await page.goto("/properties");
    await page.waitForLoadState("networkidle");
    const html = await page.content();
    await assertNoOwnerData(html);
  });

  test("property detail page (guest): no owner contact fields in HTML", async ({
    page,
  }) => {
    await page.goto("/properties");
    await page.waitForLoadState("networkidle");

    const firstLink = page.locator("a[href^='/properties/']").first();
    if ((await firstLink.count()) === 0) {
      test.skip();
      return;
    }

    const href = await firstLink.getAttribute("href");
    if (!href) return;

    await page.goto(href);
    await page.waitForLoadState("networkidle");
    const html = await page.content();
    await assertNoOwnerData(html);
  });

  test("property detail page (signed-in seeker): no owner contact fields in HTML", async ({
    page,
  }) => {
    await page.goto("/sign-in");
    await page.locator('input[type="email"]').fill(SEEKER.email);
    await page.locator('input[type="password"]').fill(SEEKER.password);
    await page.locator('button[type="submit"]').click();
    await page.waitForURL((url) => !url.pathname.startsWith("/sign-in"), {
      timeout: 10_000,
    });

    await page.goto("/properties");
    await page.waitForLoadState("networkidle");

    const firstLink = page.locator("a[href^='/properties/']").first();
    if ((await firstLink.count()) === 0) {
      test.skip();
      return;
    }

    const href = await firstLink.getAttribute("href");
    if (!href) return;

    await page.goto(href);
    await page.waitForLoadState("networkidle");
    const html = await page.content();
    await assertNoOwnerData(html);
  });
});
