CREATE TABLE IF NOT EXISTS "pricing_tiers" (
  "id" serial PRIMARY KEY NOT NULL,
  "slug" text NOT NULL,
  "name" text NOT NULL,
  "tagline" text DEFAULT '' NOT NULL,
  "starting_price" text DEFAULT '0' NOT NULL,
  "price_unit" text DEFAULT 'per user / month' NOT NULL,
  "price_prefix" text DEFAULT 'Starting at' NOT NULL,
  "most_popular" boolean DEFAULT false NOT NULL,
  "features" text DEFAULT '[]' NOT NULL,
  "excluded_features" text DEFAULT '[]' NOT NULL,
  "cta_label" text DEFAULT 'Get Started' NOT NULL,
  "cta_link" text DEFAULT '/quote' NOT NULL,
  "sort_order" integer DEFAULT 0 NOT NULL,
  "active" boolean DEFAULT true NOT NULL,
  "created_at" timestamp DEFAULT now() NOT NULL,
  "updated_at" timestamp DEFAULT now() NOT NULL,
  CONSTRAINT "pricing_tiers_slug_unique" UNIQUE("slug")
);
