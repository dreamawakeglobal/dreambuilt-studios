-- ==============================================================================
-- DREAM BUILT STUDIOS: PRODUCTION SCHEMA ALIGNMENT & SECURITY MIGRATION (08)
-- ==============================================================================
-- 1. Aligns the `public.consultations` table with all fields in `consultation.html`.
-- 2. Hardens Row-Level Security (RLS) policies for forms and intake tables.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. EXTEND CONSULTATIONS TABLE SCHEMA
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.consultations 
  ADD COLUMN IF NOT EXISTS business_type TEXT,
  ADD COLUMN IF NOT EXISTS what_to_build TEXT,
  ADD COLUMN IF NOT EXISTS has_website TEXT,
  ADD COLUMN IF NOT EXISTS primary_goal TEXT,
  ADD COLUMN IF NOT EXISTS features TEXT,
  ADD COLUMN IF NOT EXISTS budget TEXT,
  ADD COLUMN IF NOT EXISTS timeline TEXT,
  ADD COLUMN IF NOT EXISTS vision TEXT;

-- ------------------------------------------------------------------------------
-- 2. HARDEN RLS ON CONSULTATIONS & PROJECT SUBMISSIONS
-- ------------------------------------------------------------------------------
ALTER TABLE IF EXISTS public.consultations ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.project_submissions ENABLE ROW LEVEL SECURITY;

-- Drop insecure open policies
DROP POLICY IF EXISTS "Allow public consultation submissions" ON public.consultations;
DROP POLICY IF EXISTS "Allow admins to view consultations" ON public.consultations;
DROP POLICY IF EXISTS "Allow all on consultations" ON public.consultations;
DROP POLICY IF EXISTS "Public insert only for consultations" ON public.consultations;
DROP POLICY IF EXISTS "Admin full access on consultations" ON public.consultations;

DROP POLICY IF EXISTS "Allow public form submissions" ON public.project_submissions;
DROP POLICY IF EXISTS "Allow admins to view submissions" ON public.project_submissions;
DROP POLICY IF EXISTS "Allow all on project_submissions" ON public.project_submissions;
DROP POLICY IF EXISTS "Public insert only for project_submissions" ON public.project_submissions;
DROP POLICY IF EXISTS "Admin full access on project_submissions" ON public.project_submissions;

-- Public (anonymous + authenticated) can INSERT inquiries, but NEVER read, update or delete
CREATE POLICY "Public insert only for consultations" 
ON public.consultations 
FOR INSERT 
TO public, anon, authenticated 
WITH CHECK (true);

CREATE POLICY "Public insert only for project_submissions" 
ON public.project_submissions 
FOR INSERT 
TO public, anon, authenticated 
WITH CHECK (true);

-- Admin users have full access (SELECT, UPDATE, DELETE)
CREATE POLICY "Admin full access on consultations" 
ON public.consultations 
FOR ALL 
TO authenticated 
USING (
  (auth.jwt() ->> 'email') ILIKE '%@dreambuiltstudios.com'
  OR (auth.jwt() ->> 'email') = 'admin@dreambuiltstudios.com'
  OR (auth.jwt() ->> 'email') = 'tariq@dreambuiltstudios.com'
)
WITH CHECK (
  (auth.jwt() ->> 'email') ILIKE '%@dreambuiltstudios.com'
  OR (auth.jwt() ->> 'email') = 'admin@dreambuiltstudios.com'
  OR (auth.jwt() ->> 'email') = 'tariq@dreambuiltstudios.com'
);

CREATE POLICY "Admin full access on project_submissions" 
ON public.project_submissions 
FOR ALL 
TO authenticated 
USING (
  (auth.jwt() ->> 'email') ILIKE '%@dreambuiltstudios.com'
  OR (auth.jwt() ->> 'email') = 'admin@dreambuiltstudios.com'
  OR (auth.jwt() ->> 'email') = 'tariq@dreambuiltstudios.com'
)
WITH CHECK (
  (auth.jwt() ->> 'email') ILIKE '%@dreambuiltstudios.com'
  OR (auth.jwt() ->> 'email') = 'admin@dreambuiltstudios.com'
  OR (auth.jwt() ->> 'email') = 'tariq@dreambuiltstudios.com'
);
