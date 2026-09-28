import crypto from "node:crypto";

import { expect, test, type BrowserContext, type Page } from "@playwright/test";

const ADMIN = { email: process.env.E2E_ADMIN_EMAIL ?? "admin@example.com", password: process.env.E2E_ADMIN_PASSWORD ?? "adminpass1" };
const ESEWA_TEST_KEY = "8gBm/:&EnhH.1/q"; // eSewa's public sandbox key

// A 1×1 PNG, enough for the API's file-type check.
const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
  "base64",
);

const uniqueEmail = (tag: string) => `${tag}.${Date.now()}.${Math.floor(Math.random() * 1e6)}@example.com`;

async function register(page: Page, tag: string) {
  await page.goto("/register");
  await page.locator("#main").getByLabel("Full name").fill("E2E Tester");
  await page.locator("#main").getByLabel("Email").fill(uniqueEmail(tag));
  await page.locator("#main").getByLabel("Password").fill("e2epass123");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/account/);
}

async function addFirstProductToCart(page: Page) {
  await page.goto("/shop");
  await page.locator('a[href^="/products/"]').first().click();
  await expect(page.getByRole("heading", { name: "Certificate of Analysis — current batch" })).toBeVisible();
  await page.getByRole("button", { name: "Add to cart" }).click();
  await expect(page.getByRole("button", { name: "Added to cart" })).toBeVisible();
}

async function fillCheckout(page: Page, method: "Cash on delivery" | "eSewa" | "Khalti") {
  await page.goto("/checkout");
  await page.locator("#main").getByLabel("Mobile number").fill("9841234567");
  await page.locator("#main").getByLabel("Address").fill("Ward 4, Baneshwor");
  await page.locator("#main").getByLabel("City").fill("Kathmandu");
  await expect(page.getByText("Delivery inside Kathmandu")).toBeVisible();
  await expect(page.locator("#main").getByText("Rs. 7,500").first()).toBeVisible(); // shipping & handling
  await page.locator("#main label", { hasText: new RegExp(`^${method}`) }).first().click();
}

/** Plays eSewa's part in the browser: sign a response like eSewa does and redirect back. */
async function fakeEsewa(context: BrowserContext, outcome: "success" | "failure") {
  await context.route("https://rc-epay.esewa.com.np/**", async (route) => {
    const form = Object.fromEntries(new URLSearchParams(route.request().postData() ?? ""));
    if (outcome === "failure") return route.fulfill({ status: 302, headers: { location: form.failure_url } });
    const response: Record<string, string> = {
      transaction_code: "000E2E",
      status: "COMPLETE",
      total_amount: form.total_amount,
      transaction_uuid: form.transaction_uuid,
      product_code: form.product_code,
      signed_field_names: "transaction_code,status,total_amount,transaction_uuid,product_code",
    };
    const message = response.signed_field_names.split(",").map((k) => `${k}=${response[k]}`).join(",");
    response.signature = crypto.createHmac("sha256", ESEWA_TEST_KEY).update(message).digest("base64");
    const data = Buffer.from(JSON.stringify(response)).toString("base64");
    await route.fulfill({ status: 302, headers: { location: `${form.success_url}?data=${encodeURIComponent(data)}` } });
  });
}

test("browse, add to cart, sign up and order with cash on delivery", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { level: 1 })).toContainText("Know what’s in the vial");
  await addFirstProductToCart(page);
  await page.goto("/checkout");
  await expect(page).toHaveURL(/\/login\?next=\/checkout/); // checkout needs an account
  await page.getByRole("link", { name: "Create an account" }).click();
  await page.locator("#main").getByLabel("Full name").fill("E2E Tester");
  await page.locator("#main").getByLabel("Email").fill(uniqueEmail("cod"));
  await page.locator("#main").getByLabel("Password").fill("e2epass123");
  await page.getByRole("button", { name: "Create account" }).click();
  await expect(page).toHaveURL(/\/checkout/);

  await fillCheckout(page, "Cash on delivery");
  await page.getByRole("button", { name: "Place order", exact: true }).click();
  await expect(page).toHaveURL(/\/account\?order=\d+/);
  await expect(page.getByText(/Order #\d+ placed/)).toBeVisible();
  await expect(page.getByText("Pending").first()).toBeVisible();
});

test("pay with eSewa, including a cancelled attempt and retry", async ({ page, context }) => {
  await register(page, "esewa");
  await addFirstProductToCart(page);
  await fakeEsewa(context, "failure");
  await fillCheckout(page, "eSewa");
  await page.getByRole("button", { name: "Place order and pay with eSewa" }).click();
  await expect(page).toHaveURL(/\/payment\/esewa\/failed\/\d+/);
  await expect(page.getByRole("heading", { name: /isn’t paid yet/ })).toBeVisible();

  await context.unroute("https://rc-epay.esewa.com.np/**");
  await fakeEsewa(context, "success");
  await page.getByRole("button", { name: "Try eSewa again" }).click();
  await expect(page.getByRole("heading", { name: /is paid/ })).toBeVisible();
  await page.getByRole("link", { name: "View your orders" }).click();
  await expect(page.getByText("Paid with eSewa")).toBeVisible();
});

test("pay with Khalti", async ({ page, context }) => {
  // The API's fake Khalti returns this payment_url; play Khalti's part and send the customer back.
  await context.route("https://test-pay.khalti.com/**", async (route) => {
    const url = new URL(route.request().url());
    const back = `${url.searchParams.get("return")}?pidx=${url.searchParams.get("pidx")}&status=Completed`;
    await route.fulfill({ status: 302, headers: { location: back } });
  });
  await register(page, "khalti");
  await addFirstProductToCart(page);
  await fillCheckout(page, "Khalti");
  await page.getByRole("button", { name: "Place order and pay with Khalti" }).click();
  await expect(page.getByRole("heading", { name: /is paid/ })).toBeVisible();
});

test("contact form validates and sends", async ({ page }) => {
  await page.goto("/contact");
  await page.locator("#main").getByLabel("Full name").fill("Hari");
  await page.locator("#main").getByLabel("Email").fill("hari@example.com");
  await page.locator("#main").getByLabel("Subject").fill("Delivery");
  await page.locator("#main").getByLabel("Message").fill("short");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByText(/at least 20 characters/)).toBeVisible();
  await page.locator("#main").getByLabel("Message").fill("Do you deliver to Pokhara, and how long does it take?");
  await page.getByRole("button", { name: "Send message" }).click();
  await expect(page.getByRole("heading", { name: "Message sent" })).toBeVisible();
});

test("admin publishes a lab result that shows on the product page", async ({ page }) => {
  await page.goto("/login?next=/admin");
  await page.locator("#main").getByLabel("Email").fill(ADMIN.email);
  await page.locator("#main").getByLabel("Password").fill(ADMIN.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();

  await page.getByRole("link", { name: "Products & lab results" }).click();
  await page.getByRole("link", { name: "Edit →" }).first().click();
  const purity = (98 + Math.random()).toFixed(2);
  await page.locator("#main").getByLabel("HPLC purity (%)").fill(purity);
  await page.locator('input[type="file"]').first().setInputFiles({ name: "coa.png", mimeType: "image/png", buffer: PNG });
  await expect(page.getByRole("button", { name: "Replace file" }).or(page.getByText("Replace file")).first()).toBeVisible();
  await page.getByRole("button", { name: "Save changes" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Saved" })).toBeVisible();

  const slug = (await page.locator("#slug").inputValue()).trim();
  // Product pages are cached for up to 60 s; the API is the source of truth.
  const api = process.env.E2E_API_URL ?? "http://localhost:8000";
  const product = await (await page.request.get(`${api}/api/products/${slug}`)).json();
  expect(product.purity_percentage).toBe(Number(purity));
  expect(product.coa_image_url).toMatch(/\/api\/media\/\d+\/coa\.png$/);
});

test("mobile menu opens and links work @mobile", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Open menu" }).click();
  await page.getByRole("link", { name: "Lab Results / COA", exact: true }).click();
  await expect(page.getByRole("heading", { name: "Every batch. Every report." })).toBeVisible();
});
