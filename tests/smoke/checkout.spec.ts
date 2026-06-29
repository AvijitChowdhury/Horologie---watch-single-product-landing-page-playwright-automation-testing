import { test, expect } from "@playwright/test";

/**
 * Smoke test: signed-in user can reach /checkout.
 *
 * Real Google OAuth cannot be automated (consent screen + Lovable broker
 * runs only on *.lovable.app). Instead we inject the managed Supabase
 * session that Lovable mints into the sandbox at
 * LOVABLE_BROWSER_SUPABASE_SESSION_JSON, which is exactly what the
 * browser would have after a successful Google sign-in.
 *
 * Run locally / in sandbox:
 *   bun run test:smoke
 *
 * Requires LOVABLE_BROWSER_AUTH_STATUS=injected in the environment.
 */

const STORAGE_KEY = process.env.LOVABLE_BROWSER_SUPABASE_STORAGE_KEY;
const SESSION_JSON = process.env.LOVABLE_BROWSER_SUPABASE_SESSION_JSON;
const AUTH_STATUS = process.env.LOVABLE_BROWSER_AUTH_STATUS;

test("authenticated user can reach the checkout route", async ({ page }) => {
  test.skip(
    AUTH_STATUS !== "injected" || !STORAGE_KEY || !SESSION_JSON,
    `Skipping: needs an injected Lovable-managed Supabase session (LOVABLE_BROWSER_AUTH_STATUS=${AUTH_STATUS ?? "unset"}). Sign in once via the preview's "Continue with Google" button to populate it.`,
  );

  // 1. Land on the same-origin home page so localStorage writes target localhost.
  await page.goto("/", { waitUntil: "domcontentloaded" });

  // 2. Seed the Supabase session into localStorage exactly as the Supabase
  //    JS client would after a successful OAuth callback.
  await page.evaluate(
    ([key, value]) => window.localStorage.setItem(key!, value!),
    [STORAGE_KEY!, SESSION_JSON!] as const,
  );

  // 3. Navigate to /checkout. Hard-reload to force the app to read the
  //    freshly seeded session from localStorage.
  await page.goto("/checkout", { waitUntil: "networkidle" });

  // 4. Assert we actually rendered the authenticated checkout UI, not the
  //    "Sign in to continue" CTA shown to anonymous visitors.
  await expect(page).toHaveURL(/\/checkout$/);
  await expect(page.getByRole("heading", { name: /Review & confirm\./i })).toBeVisible();
  await expect(page.getByRole("button", { name: /Place mock order/i })).toBeVisible();

  // 5. The contact email should be prefilled from the signed-in user.
  const emailValue = await page.getByLabel("Email").inputValue();
  expect(emailValue).toMatch(/.+@.+\..+/);
});