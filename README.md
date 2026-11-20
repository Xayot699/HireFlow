This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Supabase configuration

Copy `.env.example` to `.env` and set the URL and publishable key from
your Supabase project:

```bash
cp .env.example .env
```

The project URL must use the format `https://<project-ref>.supabase.co`.

### Application chat and resume builder

After the `profiles`, `jobs`, and `applications` tables exist, run these SQL
files in the Supabase SQL Editor:

1. `supabase/candidate-resume.sql` adds a resume snapshot to each new
   application so the hiring team can review the exact CV that was submitted.
2. `supabase/application-chat.sql` creates the private, application-scoped chat,
   its row-level security policies, the first-application notice, and realtime
   updates.

Candidates can edit their resume at `/resume`, preview it, and use the browser's
Print dialog to save a PDF. The current resume data is copied into each new
application. Candidates and admins can then continue the conversation inside
the application; admins receive a live in-app notice when a new application
arrives.

## Candidate and admin accounts

The registration form does not accept a role. The Auth trigger creates every
new profile with the `candidate` role. To grant admin access to a trusted,
already registered account, find its Auth user ID in Supabase SQL Editor:

```sql
SELECT id, email
FROM auth.users
WHERE lower(email) = lower('admin@example.com');
```

Then assign the role to that user's existing profile, replacing the UUID:

```sql
UPDATE public.profiles
SET role = 'admin'
WHERE id = 'PASTE_AUTH_USER_UUID_HERE'
  AND role = 'candidate'
RETURNING id, full_name, role;
```

After the update, sign out and sign back in. Login reads the role from
`public.profiles` and sends admins to `/admin` and candidates to `/profile`.
Only a trusted project administrator should run this SQL.

### Review applications and archive filled jobs

The admin application page marks applications as accepted or rejected. Accepting
an applicant also archives the related job in the same database transaction.
Run this function in Supabase SQL Editor:

```sql
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

  UPDATE public.applications
  SET status = p_status,
      status_text = p_status
  WHERE id = p_application_id;

  IF p_status = 'accepted' THEN
    UPDATE public.jobs
    SET status = 'archived'
    WHERE id = v_job_id;
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_review_application(uuid, text)
FROM PUBLIC, anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_review_application(uuid, text)
TO authenticated;

NOTIFY pgrst, 'reload schema';
```

### Change a job's publishing status

The Admin → Manage Jobs page can set a vacancy to `draft`, `published`, or
`archived`. Run this function in Supabase SQL Editor:

```sql
CREATE OR REPLACE FUNCTION public.admin_set_job_status(
  p_job_id text,
  p_status text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
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

  IF p_status IS NULL OR p_status NOT IN ('draft', 'published', 'archived') THEN
    RAISE EXCEPTION 'Invalid job status';
  END IF;

  UPDATE public.jobs
  SET status = p_status
  WHERE id = p_job_id;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Job not found';
  END IF;
END;
$$;

REVOKE ALL ON FUNCTION public.admin_set_job_status(text, text)
FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.admin_set_job_status(text, text)
TO authenticated;
```

### Let admins view all job statuses

The admin jobs list includes drafts and archived jobs. Run this SELECT policy
in Supabase SQL Editor so the admin can read all statuses while public users
remain limited by the existing published-jobs policy:

```sql
DROP POLICY IF EXISTS "jobs_admin_read"
ON public.jobs;

CREATE POLICY "jobs_admin_read"
ON public.jobs
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles AS p
    WHERE p.id = (SELECT auth.uid())
      AND p.role = 'admin'
  )
);
```

### Edit, archive and restore jobs

The edit form updates job fields through the authenticated Supabase client. Add
an Admin-only UPDATE policy in SQL Editor:

```sql
GRANT UPDATE ON public.jobs TO authenticated;

DROP POLICY IF EXISTS "jobs_admin_update"
ON public.jobs;

CREATE POLICY "jobs_admin_update"
ON public.jobs
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.profiles AS p
    WHERE p.id = (SELECT auth.uid())
      AND p.role = 'admin'
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.profiles AS p
    WHERE p.id = (SELECT auth.uid())
      AND p.role = 'admin'
  )
);
```

The jobs list archives vacancies instead of permanently deleting them. An
archived vacancy remains in the admin list and can be restored to `published`
with the Restore button. Existing candidate applications remain attached.

## Live profile, application history, notifications and job statistics setup

Run this one-time setup in Supabase SQL Editor. It adds job view counts,
Candidate-owned profile updates, application status history, and secure RPCs
for recording public job views and dashboard statistics. The review RPC above
must also allow `reviewing` as shown earlier in this README.

```sql
BEGIN;

ALTER TABLE public.jobs
  ADD COLUMN IF NOT EXISTS views_count integer NOT NULL DEFAULT 0;

REVOKE UPDATE ON public.profiles FROM authenticated;
REVOKE UPDATE (role) ON public.profiles FROM authenticated;
GRANT UPDATE (
  full_name, phone, age, city, desired_position, experience_years,
  previous_company, previous_role, education, skills,
  portfolio_url, cv_url, about
) ON public.profiles TO authenticated;

DROP POLICY IF EXISTS "profiles_candidate_update_own"
ON public.profiles;

CREATE POLICY "profiles_candidate_update_own"
ON public.profiles
FOR UPDATE
TO authenticated
USING (id = (SELECT auth.uid()) AND role = 'candidate')
WITH CHECK (id = (SELECT auth.uid()) AND role = 'candidate');

DROP POLICY IF EXISTS "jobs_candidate_applied_read"
ON public.jobs;
CREATE POLICY "jobs_candidate_applied_read"
ON public.jobs
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.applications AS a
    WHERE a.job_id = public.jobs.id AND a.candidate_id = (SELECT auth.uid())
  )
);

CREATE TABLE IF NOT EXISTS public.application_status_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  previous_status text,
  new_status text NOT NULL,
  changed_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  changed_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.application_status_history ENABLE ROW LEVEL SECURITY;
GRANT SELECT ON public.application_status_history TO authenticated;

DROP POLICY IF EXISTS "application_history_admin_select"
ON public.application_status_history;
CREATE POLICY "application_history_admin_select"
ON public.application_status_history
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles AS p
    WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin'
  )
);

DROP POLICY IF EXISTS "application_history_candidate_select"
ON public.application_status_history;
CREATE POLICY "application_history_candidate_select"
ON public.application_status_history
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.applications AS a
    WHERE a.id = application_id AND a.candidate_id = (SELECT auth.uid())
  )
);

CREATE SCHEMA IF NOT EXISTS private;
CREATE OR REPLACE FUNCTION private.log_application_status_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    INSERT INTO public.application_status_history (
      application_id, previous_status, new_status, changed_by, changed_at
    ) VALUES (
      NEW.id, NULL, NEW.status, auth.uid(), COALESCE(NEW.applied_at, now())
    );
  ELSIF NEW.status IS DISTINCT FROM OLD.status THEN
    INSERT INTO public.application_status_history (
      application_id, previous_status, new_status, changed_by, changed_at
    ) VALUES (
      NEW.id, OLD.status, NEW.status, auth.uid(), now()
    );
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS application_status_history_trigger
ON public.applications;
CREATE TRIGGER application_status_history_trigger
AFTER INSERT OR UPDATE OF status ON public.applications
FOR EACH ROW EXECUTE FUNCTION private.log_application_status_change();

INSERT INTO public.application_status_history (
  application_id, previous_status, new_status, changed_by, changed_at
)
SELECT a.id, NULL, a.status, a.candidate_id, COALESCE(a.applied_at, now())
FROM public.applications AS a
WHERE NOT EXISTS (
  SELECT 1 FROM public.application_status_history AS h
  WHERE h.application_id = a.id
);

CREATE OR REPLACE FUNCTION public.record_job_view(p_job_id text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  UPDATE public.jobs
  SET views_count = views_count + 1
  WHERE id = p_job_id AND status = 'published';
END;
$$;
REVOKE ALL ON FUNCTION public.record_job_view(text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.record_job_view(text) TO anon, authenticated;

DO $$
BEGIN
  IF NOT EXISTS (
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
```

### Candidate interview invitations, offers and recommendations

Run this after the previous setup has created `application_status_history`.
Admins can send an interview invitation with its date, location, or meeting
link, a job offer, or a recommendation/next step. Candidates see these updates
on `/applications`.

```sql
BEGIN;

CREATE TABLE IF NOT EXISTS public.application_followups (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  application_id uuid NOT NULL REFERENCES public.applications(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('interview', 'offer', 'recommendation')),
  message text NOT NULL,
  interview_at timestamptz,
  location text,
  meeting_url text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.application_followups ENABLE ROW LEVEL SECURITY;
GRANT SELECT, INSERT ON public.application_followups TO authenticated;

DROP POLICY IF EXISTS "application_followups_admin_select"
ON public.application_followups;
CREATE POLICY "application_followups_admin_select"
ON public.application_followups
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles AS p
    WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin'
  )
);

DROP POLICY IF EXISTS "application_followups_admin_insert"
ON public.application_followups;
CREATE POLICY "application_followups_admin_insert"
ON public.application_followups
FOR INSERT TO authenticated
WITH CHECK (
  created_by = (SELECT auth.uid())
  AND EXISTS (
    SELECT 1 FROM public.profiles AS p
    WHERE p.id = (SELECT auth.uid()) AND p.role = 'admin'
  )
);

DROP POLICY IF EXISTS "application_followups_candidate_select"
ON public.application_followups;
CREATE POLICY "application_followups_candidate_select"
ON public.application_followups
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.applications AS a
    WHERE a.id = application_id AND a.candidate_id = (SELECT auth.uid())
  )
);

COMMIT;
```

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
