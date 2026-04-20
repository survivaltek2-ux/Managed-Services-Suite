ALTER TABLE "pricing_tiers" ADD COLUMN IF NOT EXISTS "stripe_product_id" text;
ALTER TABLE "pricing_tiers" ADD COLUMN IF NOT EXISTS "stripe_monthly_price_id" text;
ALTER TABLE "pricing_tiers" ADD COLUMN IF NOT EXISTS "stripe_annual_price_id" text;
