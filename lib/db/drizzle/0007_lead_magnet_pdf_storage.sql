-- Add column to persist the object-storage path of the generated PDF for
-- HIPAA Checklist and Buyer's Guide lead-magnet submissions. Idempotent.

ALTER TABLE "lead_magnet_submissions"
  ADD COLUMN IF NOT EXISTS "pdf_storage_path" text;
