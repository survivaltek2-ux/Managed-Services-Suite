-- Lead magnets: capture form submissions for the four downloadable resources.
-- Also adds an optional `source` field to contacts for attribution.
-- Idempotent; safe to re-run.

DO $$ BEGIN
  CREATE TYPE "lead_magnet" AS ENUM (
    'cybersecurity_assessment',
    'downtime_calculator',
    'hipaa_checklist',
    'buyers_guide'
  );
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

CREATE TABLE IF NOT EXISTS "lead_magnet_submissions" (
  "id" serial PRIMARY KEY NOT NULL,
  "magnet" "lead_magnet" NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "company" text,
  "phone" text,
  "payload" jsonb NOT NULL DEFAULT '{}'::jsonb,
  "source" text,
  "email_sent" text NOT NULL DEFAULT 'pending',
  "created_at" timestamp NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "lead_magnet_submissions_magnet_idx" ON "lead_magnet_submissions" ("magnet");
CREATE INDEX IF NOT EXISTS "lead_magnet_submissions_email_idx" ON "lead_magnet_submissions" ("email");
CREATE INDEX IF NOT EXISTS "lead_magnet_submissions_created_at_idx" ON "lead_magnet_submissions" ("created_at");

ALTER TABLE "contacts" ADD COLUMN IF NOT EXISTS "source" text;
