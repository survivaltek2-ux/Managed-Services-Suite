-- Editor-managed copy for the lead-magnet nurture email sequences.
-- One row per (magnet, step). When a row is missing for a step, the
-- scheduler falls back to the hard-coded defaults in
-- artifacts/api-server/src/lib/leadMagnetSequence.ts.
-- Idempotent.

CREATE TABLE IF NOT EXISTS "lead_magnet_sequence_steps" (
  "id" serial PRIMARY KEY NOT NULL,
  "magnet" "lead_magnet" NOT NULL,
  "step" integer NOT NULL,
  "delay_days" integer NOT NULL,
  "subject" text NOT NULL,
  "intro" text NOT NULL DEFAULT '',
  "body_html" text NOT NULL,
  "updated_at" timestamp NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS "lead_magnet_seq_steps_uniq"
  ON "lead_magnet_sequence_steps" ("magnet", "step");
