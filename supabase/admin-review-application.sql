BEGIN;

DROP FUNCTION IF EXISTS public.admin_review_application(uuid, text);

CREATE OR REPLACE FUNCTION public.admin_review_application(
  p_application_id uuid,
  p_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  v_job_id text;
  v_current_status text;
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM public.profiles AS p
    WHERE p.id = (SELECT auth.uid())
      AND p.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Admin access required'
      USING ERRCODE = '42501';
  END IF;

  IF p_status IS NULL OR p_status NOT IN ('reviewing', 'accepted', 'rejected') THEN
    RAISE EXCEPTION 'Invalid application status'
      USING ERRCODE = '22023';
  END IF;

  SELECT a.job_id, a.status
  INTO v_job_id, v_current_status
  FROM public.applications AS a
  WHERE a.id = p_application_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Application not found'
      USING ERRCODE = 'P0002';
  END IF;

  IF v_current_status IN ('accepted', 'rejected') THEN
    IF v_current_status = p_status THEN
      RETURN;
    END IF;
    RAISE EXCEPTION 'A final application decision cannot be changed'
      USING ERRCODE = '55000';
  END IF;

  -- Serialize hiring decisions for this job so two concurrent requests
  -- cannot accept different candidates for the same opening.
  PERFORM 1
  FROM public.jobs AS j
  WHERE j.id = v_job_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Related job not found'
      USING ERRCODE = 'P0002';
  END IF;

  IF p_status = 'accepted' AND EXISTS (
    SELECT 1
    FROM public.applications AS other_application
    WHERE other_application.job_id = v_job_id
      AND other_application.status = 'accepted'
      AND other_application.id <> p_application_id
  ) THEN
    RAISE EXCEPTION 'Another candidate has already been accepted for this job'
      USING ERRCODE = '23505';
  END IF;

  UPDATE public.applications AS a
  SET status = p_status,
      status_text = p_status
  WHERE a.id = p_application_id;

  IF p_status = 'accepted' THEN
    UPDATE public.jobs AS j
    SET status = 'archived'
    WHERE j.id = v_job_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_review_application(uuid, text)
FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_review_application(uuid, text)
TO authenticated;

NOTIFY pgrst, 'reload schema';

COMMIT;
