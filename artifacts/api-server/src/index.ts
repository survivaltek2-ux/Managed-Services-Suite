import app from "./app";
import { ensureTsdConfigsExist, startTsdSyncScheduler } from "./lib/tsdSync.js";
import { seedDatabase } from "./db-seed.js";
import { startZoomWebSocketSubscription } from "./lib/zoomWebSocket.js";
import { startLeadMagnetSequenceScheduler } from "./lib/leadMagnetSequence.js";
import { db } from "@workspace/db";
import { sql } from "drizzle-orm";

async function runStartupMigrations() {
  // ── Enums ─────────────────────────────────────────────────────────────────
  await db.execute(sql`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'subscription_status') THEN
        CREATE TYPE subscription_status AS ENUM (
          'active','trialing','past_due','canceled',
          'incomplete','incomplete_expired','unpaid','paused'
        );
      END IF;
    END $$`);

  await db.execute(sql`
    DO $$ BEGIN
      IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'blog_post_status') THEN
        CREATE TYPE blog_post_status AS ENUM ('draft','published','archived');
      END IF;
    END $$`);

  // ── partners — incremental columns ────────────────────────────────────────
  await db.execute(sql`ALTER TABLE partners ADD COLUMN IF NOT EXISTS sso_provider text`);
  await db.execute(sql`ALTER TABLE partners ADD COLUMN IF NOT EXISTS sso_id text`);
  await db.execute(sql`ALTER TABLE partners ADD COLUMN IF NOT EXISTS is_admin boolean NOT NULL DEFAULT false`);
  await db.execute(sql`ALTER TABLE partners ADD COLUMN IF NOT EXISTS client_tickets_enabled boolean NOT NULL DEFAULT false`);
  await db.execute(sql`ALTER TABLE partners ADD COLUMN IF NOT EXISTS stripe_customer_id text`);
  await db.execute(sql`ALTER TABLE partners ADD COLUMN IF NOT EXISTS stripe_connect_account_id text`);
  await db.execute(sql`ALTER TABLE partners ADD COLUMN IF NOT EXISTS last_stripe_reminder_sent_at timestamp`);
  await db.execute(sql`ALTER TABLE partners ADD COLUMN IF NOT EXISTS approved_at timestamp`);
  await db.execute(sql`ALTER TABLE partners ADD COLUMN IF NOT EXISTS reset_token text`);
  await db.execute(sql`ALTER TABLE partners ADD COLUMN IF NOT EXISTS reset_token_expires timestamp`);

  // ── users — reset token + Microsoft guest ────────────────────────────────
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token text`);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS reset_token_expires timestamp`);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS ms_object_id text`);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS last_login_at timestamp`);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS must_change_password boolean NOT NULL DEFAULT false`);
  await db.execute(sql`ALTER TABLE users ADD COLUMN IF NOT EXISTS stripe_customer_id text`);

  // ── partners — Microsoft guest ────────────────────────────────────────────
  await db.execute(sql`ALTER TABLE partners ADD COLUMN IF NOT EXISTS ms_object_id text`);

  // ── partner_commissions — Stripe / payout columns ─────────────────────────
  await db.execute(sql`ALTER TABLE partner_commissions ADD COLUMN IF NOT EXISTS stripe_transfer_id text`);
  await db.execute(sql`ALTER TABLE partner_commissions ADD COLUMN IF NOT EXISTS payout_method text`);
  await db.execute(sql`ALTER TABLE partner_commissions ADD COLUMN IF NOT EXISTS tsd_discrepancy text`);
  await db.execute(sql`ALTER TABLE partner_commissions ADD COLUMN IF NOT EXISTS period_start timestamp`);
  await db.execute(sql`ALTER TABLE partner_commissions ADD COLUMN IF NOT EXISTS period_end timestamp`);

  // ── lead_magnet_submissions — unsubscribe + extra fields ─────────────────
  await db.execute(sql`ALTER TABLE lead_magnet_submissions ADD COLUMN IF NOT EXISTS source text`);
  await db.execute(sql`ALTER TABLE lead_magnet_submissions ADD COLUMN IF NOT EXISTS pdf_storage_path text`);
  await db.execute(sql`ALTER TABLE lead_magnet_submissions ADD COLUMN IF NOT EXISTS unsubscribed_at timestamp`);

  // ── tsd_configs — per-entity sync timestamps ──────────────────────────────
  await db.execute(sql`ALTER TABLE tsd_configs ADD COLUMN IF NOT EXISTS last_opportunity_sync_at timestamp`);
  await db.execute(sql`ALTER TABLE tsd_configs ADD COLUMN IF NOT EXISTS last_account_sync_at timestamp`);
  await db.execute(sql`ALTER TABLE tsd_configs ADD COLUMN IF NOT EXISTS last_contact_sync_at timestamp`);
  await db.execute(sql`ALTER TABLE tsd_configs ADD COLUMN IF NOT EXISTS last_order_sync_at timestamp`);
  await db.execute(sql`ALTER TABLE tsd_configs ADD COLUMN IF NOT EXISTS last_quote_sync_at timestamp`);
  await db.execute(sql`ALTER TABLE tsd_configs ADD COLUMN IF NOT EXISTS last_activity_sync_at timestamp`);
  await db.execute(sql`ALTER TABLE tsd_configs ADD COLUMN IF NOT EXISTS last_task_sync_at timestamp`);
  await db.execute(sql`ALTER TABLE tsd_configs ADD COLUMN IF NOT EXISTS last_vendor_sync_at timestamp`);

  // ── Missing CMS / billing tables (CREATE before any ALTER) ──────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS pricing_tiers (
      id serial PRIMARY KEY,
      slug text NOT NULL UNIQUE,
      name text NOT NULL,
      tagline text NOT NULL DEFAULT '',
      starting_price text NOT NULL DEFAULT '0',
      annual_price text NOT NULL DEFAULT '0',
      price_unit text NOT NULL DEFAULT 'per user / month',
      price_prefix text NOT NULL DEFAULT 'Starting at',
      most_popular boolean NOT NULL DEFAULT false,
      features text NOT NULL DEFAULT '[]',
      excluded_features text NOT NULL DEFAULT '[]',
      cta_label text NOT NULL DEFAULT 'Get Started',
      cta_link text NOT NULL DEFAULT '/quote',
      sort_order integer NOT NULL DEFAULT 0,
      active boolean NOT NULL DEFAULT true,
      stripe_product_id text,
      stripe_monthly_price_id text,
      stripe_annual_price_id text,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    )`);

  // ── pricing_tiers — columns added after initial creation ─────────────────
  await db.execute(sql`ALTER TABLE pricing_tiers ADD COLUMN IF NOT EXISTS tagline text NOT NULL DEFAULT ''`);
  await db.execute(sql`ALTER TABLE pricing_tiers ADD COLUMN IF NOT EXISTS annual_price text NOT NULL DEFAULT '0'`);
  await db.execute(sql`ALTER TABLE pricing_tiers ADD COLUMN IF NOT EXISTS price_unit text NOT NULL DEFAULT 'per user / month'`);
  await db.execute(sql`ALTER TABLE pricing_tiers ADD COLUMN IF NOT EXISTS price_prefix text NOT NULL DEFAULT 'Starting at'`);
  await db.execute(sql`ALTER TABLE pricing_tiers ADD COLUMN IF NOT EXISTS excluded_features text NOT NULL DEFAULT '[]'`);
  await db.execute(sql`ALTER TABLE pricing_tiers ADD COLUMN IF NOT EXISTS stripe_product_id text`);
  await db.execute(sql`ALTER TABLE pricing_tiers ADD COLUMN IF NOT EXISTS stripe_monthly_price_id text`);
  await db.execute(sql`ALTER TABLE pricing_tiers ADD COLUMN IF NOT EXISTS stripe_annual_price_id text`);

  // ── pricing_tiers — fix annual prices that were seeded as "0" ────────────
  // Also clear any stale Stripe annual price IDs created at $0 so checkout
  // auto-creates correct live-mode prices on the next attempt.
  await db.execute(sql`
    UPDATE pricing_tiers SET annual_price = '76',  stripe_annual_price_id = NULL
    WHERE slug = 'essentials' AND (annual_price = '0' OR annual_price = '')`);
  await db.execute(sql`
    UPDATE pricing_tiers SET annual_price = '127', stripe_annual_price_id = NULL
    WHERE slug = 'business'   AND (annual_price = '0' OR annual_price = '')`);
  await db.execute(sql`
    UPDATE pricing_tiers SET annual_price = '195', stripe_annual_price_id = NULL
    WHERE slug = 'enterprise' AND (annual_price = '0' OR annual_price = '')`);

  // ── Other missing tables ──────────────────────────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS case_studies (
      id serial PRIMARY KEY,
      slug text NOT NULL UNIQUE,
      title text NOT NULL,
      client text NOT NULL,
      industry text NOT NULL DEFAULT 'General',
      summary text NOT NULL,
      problem text NOT NULL,
      solution text NOT NULL,
      result text NOT NULL,
      metrics text NOT NULL DEFAULT '[]',
      services text NOT NULL DEFAULT '[]',
      cover_image text,
      logo_url text,
      quote text,
      quote_author text,
      quote_role text,
      featured boolean NOT NULL DEFAULT false,
      active boolean NOT NULL DEFAULT true,
      sort_order integer NOT NULL DEFAULT 0,
      published_at timestamp DEFAULT now(),
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    )`);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS certifications (
      id serial PRIMARY KEY,
      name text NOT NULL,
      category text NOT NULL DEFAULT 'partner',
      logo_url text,
      url text,
      sort_order integer NOT NULL DEFAULT 0,
      active boolean NOT NULL DEFAULT true,
      created_at timestamp NOT NULL DEFAULT now()
    )`);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS company_stats (
      id serial PRIMARY KEY,
      label text NOT NULL,
      value text NOT NULL,
      suffix text,
      icon text NOT NULL DEFAULT 'TrendingUp',
      sort_order integer NOT NULL DEFAULT 0,
      active boolean NOT NULL DEFAULT true,
      created_at timestamp NOT NULL DEFAULT now()
    )`);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS industries (
      id serial PRIMARY KEY,
      slug text NOT NULL UNIQUE,
      name text NOT NULL,
      short_label text NOT NULL DEFAULT '',
      nav_title text NOT NULL DEFAULT '',
      meta_description text NOT NULL DEFAULT '',
      hero_eyebrow text NOT NULL DEFAULT '',
      hero_title text NOT NULL DEFAULT '',
      hero_subtitle text NOT NULL DEFAULT '',
      pain_points text NOT NULL DEFAULT '[]',
      regulations text NOT NULL DEFAULT '[]',
      software_stacks text NOT NULL DEFAULT '[]',
      what_we_do text NOT NULL DEFAULT '[]',
      testimonial_quote text NOT NULL DEFAULT '',
      testimonial_name text NOT NULL DEFAULT '',
      testimonial_role text NOT NULL DEFAULT '',
      testimonial_company text NOT NULL DEFAULT '',
      case_study_hint text NOT NULL DEFAULT '',
      related_services text NOT NULL DEFAULT '[]',
      cta_label text NOT NULL DEFAULT 'Book a consultation',
      sort_order integer NOT NULL DEFAULT 0,
      active boolean NOT NULL DEFAULT true,
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    )`);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS page_sections (
      id serial PRIMARY KEY,
      page_slug text NOT NULL,
      section_key text NOT NULL,
      content text NOT NULL,
      updated_at timestamp NOT NULL DEFAULT now()
    )`);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id serial PRIMARY KEY,
      user_id integer,
      partner_id integer,
      stripe_subscription_id text NOT NULL UNIQUE,
      stripe_customer_id text NOT NULL,
      stripe_price_id text NOT NULL,
      stripe_product_id text,
      plan_id text NOT NULL,
      plan_name text NOT NULL,
      status subscription_status NOT NULL DEFAULT 'incomplete',
      current_period_start timestamp,
      current_period_end timestamp,
      cancel_at_period_end boolean NOT NULL DEFAULT false,
      canceled_at timestamp,
      billing_cycle text NOT NULL DEFAULT 'monthly',
      amount decimal(12,2),
      created_at timestamp NOT NULL DEFAULT now(),
      updated_at timestamp NOT NULL DEFAULT now()
    )`);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS lead_magnet_sequence_steps (
      id serial PRIMARY KEY,
      magnet lead_magnet NOT NULL,
      step integer NOT NULL,
      delay_days integer NOT NULL,
      subject text NOT NULL,
      intro text NOT NULL DEFAULT '',
      body_html text NOT NULL,
      updated_at timestamp NOT NULL DEFAULT now(),
      CONSTRAINT lead_magnet_seq_steps_uniq UNIQUE (magnet, step)
    )`);

  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS lead_magnet_sequence_sends (
      id serial PRIMARY KEY,
      submission_id integer NOT NULL REFERENCES lead_magnet_submissions(id) ON DELETE CASCADE,
      step integer NOT NULL,
      status text NOT NULL DEFAULT 'sent',
      sent_at timestamp NOT NULL DEFAULT now(),
      CONSTRAINT lead_magnet_seq_uniq UNIQUE (submission_id, step)
    )`);

  // ── esign_envelopes — e-signature tracking ───────────────────────────────
  await db.execute(sql`
    CREATE TABLE IF NOT EXISTS esign_envelopes (
      id                    serial PRIMARY KEY,
      document_id           integer REFERENCES documents(id),
      partner_id            integer REFERENCES partners(id),
      provider_envelope_id  text NOT NULL UNIQUE,
      document_name         text NOT NULL,
      signers_json          text NOT NULL DEFAULT '[]',
      status                text NOT NULL DEFAULT 'sent',
      subject               text,
      message               text,
      initiated_by_email    text,
      initiated_by_name     text,
      events_json           text NOT NULL DEFAULT '[]',
      executed_document_id  integer REFERENCES documents(id),
      sent_at               timestamp NOT NULL DEFAULT now(),
      completed_at          timestamp,
      created_at            timestamp NOT NULL DEFAULT now(),
      updated_at            timestamp NOT NULL DEFAULT now()
    )`);

  console.log("[migrate] Startup migrations applied");
}

const rawPort = process.env["PORT"] ?? "8080";
const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, async () => {
  console.log(`Server listening on port ${port}`);
  try {
    await runStartupMigrations();
  } catch (err) {
    console.error("[migrate] Startup migration error:", err);
  }
  try {
    await seedDatabase();
  } catch (err) {
    console.error("[seed] Startup seed error:", err);
  }
  try {
    await ensureTsdConfigsExist();
    await startTsdSyncScheduler();
  } catch (err) {
    console.error("[TSD] Startup error:", err);
  }
  try {
    await startZoomWebSocketSubscription();
  } catch (err) {
    console.error("[Zoom WS] Startup error:", err);
  }
  try {
    startLeadMagnetSequenceScheduler();
  } catch (err) {
    console.error("[LeadMagnetSeq] Startup error:", err);
  }
});
