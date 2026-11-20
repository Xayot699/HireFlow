BEGIN;

CREATE TABLE IF NOT EXISTS public.application_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  sender_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  body text NOT NULL CHECK (char_length(btrim(body)) BETWEEN 1 AND 3000),
  is_system boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS application_messages_thread_idx
  ON public.application_messages (application_id, created_at, id);

CREATE SCHEMA IF NOT EXISTS private;

ALTER TABLE public.application_messages ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.application_messages TO authenticated;
REVOKE UPDATE, DELETE ON public.application_messages FROM authenticated;

DROP POLICY IF EXISTS "application_messages_participant_read"
  ON public.application_messages;
CREATE POLICY "application_messages_participant_read"
ON public.application_messages
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.applications AS a
    WHERE a.id = application_id
      AND (
        a.candidate_id = (SELECT auth.uid())
        OR EXISTS (
          SELECT 1 FROM public.profiles AS p
          WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin'
        )
      )
  )
);

DROP POLICY IF EXISTS "application_messages_participant_send"
  ON public.application_messages;
CREATE POLICY "application_messages_participant_send"
ON public.application_messages
FOR INSERT TO authenticated
WITH CHECK (
  sender_id = (SELECT auth.uid())
  AND is_system = false
  AND EXISTS (
    SELECT 1
    FROM public.applications AS a
    WHERE a.id = application_id
      AND (
        a.candidate_id = (SELECT auth.uid())
        OR EXISTS (
          SELECT 1 FROM public.profiles AS p
          WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin'
        )
      )
  )
);

-- A fresh application creates an in-thread notice that is visible to both
-- the candidate and the admin. The admin navigation already listens for new
-- application inserts and refreshes the pending badge in real time.
CREATE OR REPLACE FUNCTION private.create_application_chat_notice()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.application_messages (application_id, sender_id, body, is_system)
  VALUES (NEW.id, NULL, 'Application submitted. The hiring team can now review this application.', true);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS application_chat_notice_trigger
  ON public.applications;
CREATE TRIGGER application_chat_notice_trigger
AFTER INSERT ON public.applications
FOR EACH ROW EXECUTE FUNCTION private.create_application_chat_notice();

REVOKE ALL ON FUNCTION private.create_application_chat_notice() FROM PUBLIC, anon, authenticated;

DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (
       SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime'
         AND schemaname = 'public'
         AND tablename = 'application_messages'
     ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.application_messages';
  END IF;
  IF EXISTS (SELECT 1 FROM pg_publication WHERE pubname = 'supabase_realtime')
     AND NOT EXISTS (
       SELECT 1 FROM pg_publication_tables
       WHERE pubname = 'supabase_realtime'
         AND schemaname = 'public'
         AND tablename = 'applications'
     ) THEN
    EXECUTE 'ALTER PUBLICATION supabase_realtime ADD TABLE public.applications';
  END IF;
END;
$$;

COMMIT;
