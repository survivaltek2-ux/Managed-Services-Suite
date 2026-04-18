DO $$ BEGIN
  CREATE TYPE "public"."lead_magnet" AS ENUM ('cybersecurity_assessment', 'downtime_calculator', 'hipaa_checklist', 'buyers_guide');
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lead_magnet_submissions" (
  "id" serial PRIMARY KEY NOT NULL,
  "magnet" "lead_magnet" NOT NULL,
  "name" text NOT NULL,
  "email" text NOT NULL,
  "company" text,
  "phone" text,
  "payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
  "source" text,
  "email_sent" text DEFAULT 'pending' NOT NULL,
  "unsubscribed_at" timestamp,
  "created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "lead_magnet_submissions" ADD COLUMN IF NOT EXISTS "unsubscribed_at" timestamp;
--> statement-breakpoint
CREATE TABLE IF NOT EXISTS "lead_magnet_sequence_sends" (
  "id" serial PRIMARY KEY NOT NULL,
  "submission_id" integer NOT NULL,
  "step" integer NOT NULL,
  "status" text DEFAULT 'sent' NOT NULL,
  "sent_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DO $$ BEGIN
  ALTER TABLE "lead_magnet_sequence_sends"
    ADD CONSTRAINT "lead_magnet_sequence_sends_submission_id_fk"
    FOREIGN KEY ("submission_id") REFERENCES "public"."lead_magnet_submissions"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
--> statement-breakpoint
CREATE UNIQUE INDEX IF NOT EXISTS "lead_magnet_seq_uniq" ON "lead_magnet_sequence_sends" ("submission_id", "step");
