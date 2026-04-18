-- Track which pricing tier (essentials / business / enterprise / custom slug)
-- the visitor clicked on the Pricing page before landing on /quote.
-- Idempotent.

ALTER TABLE "quotes"
  ADD COLUMN IF NOT EXISTS "requested_tier" text;
