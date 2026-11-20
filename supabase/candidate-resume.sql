BEGIN;

ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS resume_snapshot jsonb NOT NULL DEFAULT '{}'::jsonb;

COMMIT;
