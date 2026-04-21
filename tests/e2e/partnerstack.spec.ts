import { test, expect, request } from "@playwright/test";
import crypto from "node:crypto";
import { Client } from "pg";

/**
 * E2E coverage for the PartnerStack admin dashboard and webhook receiver.
 *
 * Test 1: Logs in as a fresh users-table admin, opens
 *         /partners/admin/partnerstack, asserts the page renders, then
 *         clicks "Sync Now" and asserts a result toast appears.
 *
 * Test 2: Posts a fake `partner.created` payload with a valid HMAC to
 *         /api/webhooks/partnerstack, then logs in and asserts the new
 *         event appears in the "Recent Webhook Events" table.
 *
 * The admin endpoints (`/api/admin/partnerstack/*`) require a users-table
 * admin (role = 'admin'); partner-table admins are NOT supported today
 * (tracked separately).
 */

const PORTAL_BASE = "/partners";
const ADMIN_PATH = `${PORTAL_BASE}/admin/partnerstack`;
const LOGIN_PATH = `${PORTAL_BASE}/login`;
const DASHBOARD_PATH = `${PORTAL_BASE}/dashboard`;
const TEST_PASSWORD = "TestPassword123!";

// Pre-computed bcrypt hash of TEST_PASSWORD (cost 10) so the test does not
// need to bring its own bcrypt dependency.
const TEST_PASSWORD_BCRYPT =
  "$2b$10$Ad6LPSRxjBHNpOyfJHN/H.EYq8hPmr79RmKSHX/eSiLSWmuQudWtC";

const WEBHOOK_SECRET =
  process.env.E2E_PARTNERSTACK_WEBHOOK_SECRET ||
  process.env.PARTNERSTACK_WEBHOOK_SECRET ||
  "e2e_webhook_secret_for_testing_only";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  throw new Error(
    "DATABASE_URL is required to run the e2e tests (it points at the dev DB)."
  );
}

let pg: Client;

test.beforeAll(async () => {
  pg = new Client({ connectionString: DATABASE_URL });
  await pg.connect();
});

test.afterAll(async () => {
  await pg?.end();
});

async function insertAdminUser(label: string): Promise<{ id: number; email: string }> {
  const email = `pstack-${label}-${Date.now()}-${Math.random()
    .toString(36)
    .slice(2, 6)}@test.local`;
  const { rows } = await pg.query<{ id: number }>(
    `INSERT INTO users (name, email, password, company, role)
     VALUES ($1, $2, $3, $4, 'admin') RETURNING id`,
    [`PStack E2E ${label}`, email, TEST_PASSWORD_BCRYPT, 'PStack E2E']
  );
  return { id: rows[0].id, email };
}

async function deleteUser(email: string): Promise<void> {
  await pg.query(`DELETE FROM users WHERE email = $1`, [email]);
}

async function loginAsAdmin(
  page: import("@playwright/test").Page,
  baseURL: string | undefined,
  email: string
) {
  // Hit the admin login endpoint directly to obtain a JWT, then inject it
  // into localStorage. This bypasses the UI login form (which has multiple
  // tabs/SSO branches that are not the focus of this test) and gives us a
  // deterministic, fast path into the protected routes. The partner portal's
  // useAuth hook reads `partner_token` from localStorage and the API's
  // `requirePartnerAuth` middleware accepts admin tokens (userId + role:
  // 'admin') in addition to partner tokens.
  const api = await request.newContext({ baseURL });
  const loginRes = await api.post("/api/auth/login", {
    headers: { "Content-Type": "application/json" },
    data: JSON.stringify({ email, password: TEST_PASSWORD }),
  });
  if (!loginRes.ok()) {
    throw new Error(`admin /api/auth/login failed: ${loginRes.status()} ${await loginRes.text()}`);
  }
  const { token } = (await loginRes.json()) as { token: string };

  // We need a real navigation before we can write to localStorage on the
  // portal origin. Land on /partners/login (always public) first, then plant
  // the token, then proceed.
  await page.goto(LOGIN_PATH);
  await page.evaluate((t) => {
    window.localStorage.setItem("partner_token", t);
  }, token);
}

test.describe("PartnerStack admin", () => {
  test("admin page renders and Sync Now produces a toast", async ({ page, baseURL }) => {
    const admin = await insertAdminUser("page");
    try {
      await loginAsAdmin(page, baseURL, admin.email);

      await page.goto(ADMIN_PATH);

      // Heading + key sections render
      await expect(
        page.getByRole("heading", { name: "PartnerStack Sync" })
      ).toBeVisible();
      await expect(page.getByText("Connection Status", { exact: true })).toBeVisible();
      await expect(
        page.getByText("Synced Partners", { exact: true }).first()
      ).toBeVisible();
      await expect(
        page.getByText("Recent Sync Activity", { exact: true })
      ).toBeVisible();
      await expect(
        page.getByText("Recent Webhook Events", { exact: true })
      ).toBeVisible();
      await expect(page.getByText("Last Push", { exact: true })).toBeVisible();
      await expect(page.getByText("Last Pull", { exact: true })).toBeVisible();
      await expect(page.getByText("Total Events", { exact: true })).toBeVisible();

      // The connection card should reflect a configured (good or failed) state.
      // In dev with placeholder PartnerStack keys we expect "Connection failed";
      // with real keys we'd see "Connected". Either way, NOT "Not configured".
      const banner = page.locator("text=/Connected|Connection failed|Not configured/");
      await expect(banner.first()).toBeVisible();
      await expect(page.getByText("Not configured", { exact: true })).toHaveCount(0);

      // Sync Now should be enabled when configured and produce a toast.
      const syncBtn = page.getByRole("button", { name: /sync now/i });
      await expect(syncBtn).toBeEnabled();
      await syncBtn.click();

      // The toast title is "Sync complete" (success) or "Sync failed" (real
      // PartnerStack rejected our keys). Either confirms the click was wired
      // up and the API responded.
      const toast = page.locator(
        "text=/^(Sync complete|Sync failed)$/"
      );
      await expect(toast.first()).toBeVisible({ timeout: 20_000 });
    } finally {
      await deleteUser(admin.email);
    }
  });

  test("posting a signed webhook records the event and shows it in the admin", async ({
    page,
    baseURL,
  }) => {
    const admin = await insertAdminUser("webhook");
    const eventId = `e2e-evt-${Date.now()}-${Math.random()
      .toString(36)
      .slice(2, 8)}`;
    const partnerKey = `e2e_pkey_${Date.now()}_${Math.random()
      .toString(36)
      .slice(2, 6)}`;
    const fakeEmail = `e2e-fake-partner-${Date.now()}@test.local`;

    const payload = {
      id: eventId,
      type: "partner.created",
      data: {
        key: partnerKey,
        email: fakeEmail,
        first_name: "E2E",
        last_name: "Webhook",
        company: "E2E Webhook Co",
        state: "approved",
      },
    };

    const rawBody = JSON.stringify(payload);
    const sig = crypto
      .createHmac("sha256", WEBHOOK_SECRET)
      .update(rawBody)
      .digest("hex");

    try {
      const api = await request.newContext({ baseURL });
      const res = await api.post("/api/webhooks/partnerstack", {
        headers: {
          "Content-Type": "application/json",
          "x-partnerstack-signature": sig,
        },
        data: rawBody,
      });
      expect(res.status(), await res.text()).toBe(200);
      const body = await res.json();
      expect(body.received).toBe(true);

      // Event row should land in the DB; processing is async so allow a moment.
      let row: { event_id: string; event_type: string; status: string } | undefined;
      for (let i = 0; i < 20; i++) {
        const q = await pg.query<{
          event_id: string;
          event_type: string;
          status: string;
        }>(
          `SELECT event_id, event_type, status
           FROM partnerstack_webhook_events WHERE event_id = $1`,
          [eventId]
        );
        row = q.rows[0];
        if (row && (row.status === "processed" || row.status === "received")) break;
        await new Promise((r) => setTimeout(r, 250));
      }
      expect(row, "webhook event was not recorded in DB").toBeTruthy();
      expect(row!.event_type).toBe("partner.created");
      expect(["processed", "received"]).toContain(row!.status);

      // Now the admin UI should surface the new event.
      await loginAsAdmin(page, baseURL, admin.email);

      // Strong assertion: hit the same admin API the UI uses and confirm
      // THIS run's eventId is present, not just any partner.created row.
      const adminToken = await page.evaluate(() =>
        window.localStorage.getItem("partner_token")
      );
      const adminApi = await request.newContext({ baseURL });
      const eventsRes = await adminApi.get(
        "/api/admin/partnerstack/webhook-events",
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );
      expect(eventsRes.status(), await eventsRes.text()).toBe(200);
      const eventsBody = (await eventsRes.json()) as {
        events: Array<{ eventId: string; eventType: string }>;
      };
      const ours = eventsBody.events.find((e) => e.eventId === eventId);
      expect(ours, `event ${eventId} not returned by admin API`).toBeTruthy();
      expect(ours!.eventType).toBe("partner.created");

      // And confirm the UI table actually renders rows (proves the page
      // wires up to that API and the data is reachable from the browser).
      await page.goto(ADMIN_PATH);
      await expect(
        page.getByRole("heading", { name: "PartnerStack Sync" })
      ).toBeVisible();
      await expect(
        page.getByText("Recent Webhook Events", { exact: true })
      ).toBeVisible();
      const eventTypeCells = page.locator("td", {
        hasText: /^partner\.created$/,
      });
      await expect(eventTypeCells.first()).toBeVisible({ timeout: 10_000 });
      expect(await eventTypeCells.count()).toBeGreaterThan(0);
    } finally {
      await pg
        .query(`DELETE FROM partnerstack_webhook_events WHERE event_id = $1`, [
          eventId,
        ])
        .catch(() => {});
      await pg
        .query(`DELETE FROM partners WHERE partnerstack_key = $1`, [partnerKey])
        .catch(() => {});
      await pg
        .query(`DELETE FROM partners WHERE email = $1`, [fakeEmail])
        .catch(() => {});
      await deleteUser(admin.email);
    }
  });
});
