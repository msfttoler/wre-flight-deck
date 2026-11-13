import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

async function findFlights(page) {
  await page.goto("/");
  await page.getByTestId("origin").selectOption("SEA");
  await page.getByTestId("destination").selectOption("DEN");
  await page.getByTestId("passengers").selectOption("1");
  await page.getByTestId("search-flights").click();
  await expect(page.getByTestId("itinerary-option").first()).toBeVisible();
}

async function chooseFlight(page) {
  await findFlights(page);
  await page.getByTestId("itinerary-select").first().click();
  await expect(page.getByTestId("quote-submit")).toBeVisible();
}

test("a real quote becomes a persisted booking and cancellation releases its seats", async ({ page, request }) => {
  const errors = [];
  page.on("pageerror", error => errors.push(error.message));
  await chooseFlight(page);
  await page.getByTestId("quote-coupon").fill("FIRSTFLIGHT");
  await page.getByTestId("quote-submit").click();
  await expect(page.getByTestId("booking-submit")).toBeVisible();
  const quotes = await request.get("/api/events");
  expect(quotes.ok()).toBeTruthy();
  const callsign = `CREW${Date.now().toString().slice(-9)}`;
  await page.getByTestId("booking-callsign").fill(callsign);
  await page.getByTestId("booking-submit").click();
  await page.getByTestId("nav-reservations").click();
  const row = page.getByTestId("booking-row").filter({ hasText: callsign });
  await expect(row).toBeVisible();
  const before = (await (await request.get("/api/bookings")).json()).bookings.find(b => b.callsign === callsign);
  expect(before.status).toBe("confirmed");
  const inventory = (await (await request.get("/api/network")).json()).flights;
  const seats = inventory.find(f => f.id === before.flightIds[0]).availableSeats;
  await page.reload();
  await page.getByTestId("nav-reservations").click();
  await expect(page.getByTestId("booking-row").filter({ hasText: callsign })).toBeVisible();
  await row.getByTestId("booking-cancel").click();
  // The UI may ask for an explicit inline confirmation before the actual write.
  const confirm = row.getByRole("button", { name: /confirm cancellation/i });
  if (await confirm.isVisible()) await confirm.click();
  await expect.poll(async () => {
    const body = await (await request.get("/api/bookings")).json();
    return body.bookings.find(b => b.id === before.id)?.status;
  }).toBe("cancelled");
  const after = (await (await request.get("/api/network")).json()).flights;
  expect(after.find(f => f.id === before.flightIds[0]).availableSeats).toBe(seats + 1);
  await page.getByTestId("nav-journal").click();
  await expect(page.getByRole("main")).toContainText(/cancel/i);
  expect(errors).toEqual([]);
});

test("an invalid coupon reports the real API error without booking anything", async ({ page, request }) => {
  const before = (await (await request.get("/api/bookings")).json()).bookings.length;
  await chooseFlight(page);
  await page.getByTestId("quote-coupon").fill("NOTREAL");
  await page.getByTestId("quote-submit").click();
  await expect(page.getByRole("status").filter({ hasText: /coupon/i })).toContainText(/FIRSTFLIGHT/);
  expect((await (await request.get("/api/bookings")).json()).bookings.length).toBe(before);
  await page.getByTestId("quote-coupon").fill("");
  await page.getByTestId("quote-submit").click();
  await expect(page.getByTestId("booking-submit")).toBeVisible();
});

test("the API rejects stale departure updates instead of overwriting an operator", async ({ request }) => {
  const network = await (await request.get("/api/network")).json();
  const flight = network.flights.find(f => f.status === "scheduled");
  const first = await request.patch(`/api/flights/${flight.id}`, {
    data: { version: flight.version, status: flight.status, gate: "A09" },
  });
  expect(first.ok()).toBeTruthy();
  const stale = await request.patch(`/api/flights/${flight.id}`, {
    data: { version: flight.version, status: flight.status, gate: "B04" },
  });
  expect(stale.status()).toBe(409);
  const updated = (await (await request.get("/api/network")).json()).flights.find(f => f.id === flight.id);
  expect(updated.gate).toBe("A09");
});

test("both themes and all main views have no automated axe findings or page overflow", async ({ page }) => {
  for (const theme of ["light", "dark"]) {
    await page.goto(`/?scoutTheme=${theme}`);
    await expect(page.getByTestId("search-flights")).toBeEnabled();
    for (const view of [null, "nav-reservations", "nav-operations", "nav-journal"]) {
      if (view) await page.getByTestId(view).click();
      const results = await new AxeBuilder({ page })
        .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"])
        .analyze();
      expect(results.violations).toEqual([]);
      expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBeTruthy();
    }
  }
});

test("keyboard users can reach the main journey and select a route", async ({ page }) => {
  await page.goto("/");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("link", { name: /skip/i })).toBeFocused();
  await page.keyboard.press("Enter");
  await page.getByTestId("origin").focus();
  await page.getByTestId("origin").selectOption("SEA");
  await page.getByTestId("destination").selectOption("DEN");
  await page.getByTestId("passengers").selectOption("1");
  await page.getByTestId("search-flights").focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("itinerary-option").first()).toBeVisible();
  await page.getByTestId("itinerary-select").first().focus();
  await page.keyboard.press("Enter");
  await expect(page.getByTestId("quote-submit")).toBeVisible();
});
