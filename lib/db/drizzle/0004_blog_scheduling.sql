-- Adds editorial calendar fields to blog_posts.
-- Idempotent; safe to re-run.
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "scheduled_at" timestamp;
ALTER TABLE "blog_posts" ADD COLUMN IF NOT EXISTS "content_type" text DEFAULT 'news' NOT NULL;
