-- ==============================================================================
-- DREAM BUILT STUDIOS: PRODUCTION SECURITY HARDENING & ROW-LEVEL SECURITY (07)
-- ==============================================================================
-- This script replaces all open `USING (true)` policies with strict,
-- production-grade Row-Level Security (RLS) rules and storage constraints.
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. ADMIN ROLE IDENTIFIER & HELPER FUNCTIONS
-- ------------------------------------------------------------------------------

-- Create or update admin users registry
CREATE TABLE IF NOT EXISTS public.admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  role TEXT DEFAULT 'admin' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;

-- Helper function: Check if current authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (
    auth.role() = 'authenticated' AND (
      EXISTS (
        SELECT 1 FROM public.admin_users WHERE user_id = auth.uid() OR email = (auth.jwt() ->> 'email')
      )
      OR (auth.jwt() ->> 'email') ILIKE '%@dreambuiltstudios.com'
      OR (auth.jwt() ->> 'email') = 'admin@dreambuiltstudios.com'
      OR (auth.jwt() ->> 'email') = 'tariq@dreambuiltstudios.com'
    )
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------------------------
-- 2. PUBLIC INTAKE & CONSULTATION FORMS (INSERT ONLY FOR PUBLIC, READ FOR ADMIN)
-- ------------------------------------------------------------------------------

-- 2.1 Project Submissions (Intake Wizard)
ALTER TABLE IF EXISTS public.project_submissions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public form submissions" ON public.project_submissions;
DROP POLICY IF EXISTS "Allow admins to view submissions" ON public.project_submissions;
DROP POLICY IF EXISTS "Allow all on project_submissions" ON public.project_submissions;
DROP POLICY IF EXISTS "Public insert only for project_submissions" ON public.project_submissions;
DROP POLICY IF EXISTS "Admin full access on project_submissions" ON public.project_submissions;

-- Public can submit inquiries, but can NEVER read or delete customer data
CREATE POLICY "Public insert only for project_submissions" 
ON public.project_submissions 
FOR INSERT 
TO public, anon, authenticated 
WITH CHECK (true);

-- Only authenticated admins can read, update, or delete customer inquiries
CREATE POLICY "Admin full access on project_submissions" 
ON public.project_submissions 
FOR ALL 
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- 2.2 Consultations (Calendar & Meeting Bookings)
ALTER TABLE IF EXISTS public.consultations ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public consultation submissions" ON public.consultations;
DROP POLICY IF EXISTS "Allow admins to view consultations" ON public.consultations;
DROP POLICY IF EXISTS "Allow all on consultations" ON public.consultations;
DROP POLICY IF EXISTS "Public insert only for consultations" ON public.consultations;
DROP POLICY IF EXISTS "Admin full access on consultations" ON public.consultations;

CREATE POLICY "Public insert only for consultations" 
ON public.consultations 
FOR INSERT 
TO public, anon, authenticated 
WITH CHECK (true);

CREATE POLICY "Admin full access on consultations" 
ON public.consultations 
FOR ALL 
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- ------------------------------------------------------------------------------
-- 3. CLIENT PORTAL & PROJECT DATA ACCESS (STRICT CLIENT-SCOPED & ADMIN RLS)
-- ------------------------------------------------------------------------------

-- Drop all insecure open policies from earlier prototyping scripts
DROP POLICY IF EXISTS "Allow read/write on clients" ON public.clients;
DROP POLICY IF EXISTS "Open read/write for clients" ON public.clients;
DROP POLICY IF EXISTS "Allow read/write on projects" ON public.projects;
DROP POLICY IF EXISTS "Open read/write for projects" ON public.projects;
DROP POLICY IF EXISTS "Allow read/write on website_pages" ON public.website_pages;
DROP POLICY IF EXISTS "Open read/write for website_pages" ON public.website_pages;
DROP POLICY IF EXISTS "Allow read/write on action_items" ON public.action_items;
DROP POLICY IF EXISTS "Open read/write for action_items" ON public.action_items;
DROP POLICY IF EXISTS "Allow read/write on feedback_items" ON public.feedback_items;
DROP POLICY IF EXISTS "Open read/write for feedback_items" ON public.feedback_items;
DROP POLICY IF EXISTS "Allow read/write on messages" ON public.messages;
DROP POLICY IF EXISTS "Open read/write for messages" ON public.messages;
DROP POLICY IF EXISTS "Allow read/write on project_checklist_items" ON public.project_checklist_items;
DROP POLICY IF EXISTS "Open read/write for project_checklist_items" ON public.project_checklist_items;

-- 3.1 Clients Table
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view their own profile" 
ON public.clients 
FOR SELECT 
TO authenticated 
USING (
  id = auth.uid() 
  OR email = (auth.jwt() ->> 'email')
  OR public.is_admin()
);

CREATE POLICY "Admins have full access on clients" 
ON public.clients 
FOR ALL 
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- 3.2 Projects Table
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view their own projects" 
ON public.projects 
FOR SELECT 
TO authenticated 
USING (
  client_id = auth.uid() 
  OR client_id IN (SELECT id FROM public.clients WHERE email = (auth.jwt() ->> 'email'))
  OR public.is_admin()
);

CREATE POLICY "Admins have full access on projects" 
ON public.projects 
FOR ALL 
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- 3.3 Website Pages (Mockups & Screenshots)
ALTER TABLE public.website_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view pages for their projects" 
ON public.website_pages 
FOR SELECT 
TO authenticated 
USING (
  project_id IN (
    SELECT id FROM public.projects 
    WHERE client_id = auth.uid() 
       OR client_id IN (SELECT id FROM public.clients WHERE email = (auth.jwt() ->> 'email'))
  )
  OR public.is_admin()
);

CREATE POLICY "Admins have full access on website_pages" 
ON public.website_pages 
FOR ALL 
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- 3.4 Action Items (Client Attention Tasks)
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view and update their action items" 
ON public.action_items 
FOR ALL 
TO authenticated 
USING (
  project_id IN (
    SELECT id FROM public.projects 
    WHERE client_id = auth.uid() 
       OR client_id IN (SELECT id FROM public.clients WHERE email = (auth.jwt() ->> 'email'))
  )
  OR public.is_admin()
)
WITH CHECK (
  project_id IN (
    SELECT id FROM public.projects 
    WHERE client_id = auth.uid() 
       OR client_id IN (SELECT id FROM public.clients WHERE email = (auth.jwt() ->> 'email'))
  )
  OR public.is_admin()
);


-- 3.5 Feedback Items (Revision Board)
ALTER TABLE public.feedback_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can manage feedback on their projects" 
ON public.feedback_items 
FOR ALL 
TO authenticated 
USING (
  project_id IN (
    SELECT id FROM public.projects 
    WHERE client_id = auth.uid() 
       OR client_id IN (SELECT id FROM public.clients WHERE email = (auth.jwt() ->> 'email'))
  )
  OR public.is_admin()
)
WITH CHECK (
  project_id IN (
    SELECT id FROM public.projects 
    WHERE client_id = auth.uid() 
       OR client_id IN (SELECT id FROM public.clients WHERE email = (auth.jwt() ->> 'email'))
  )
  OR public.is_admin()
);


-- 3.6 Messages Table
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view and send messages on their projects" 
ON public.messages 
FOR ALL 
TO authenticated 
USING (
  project_id IN (
    SELECT id FROM public.projects 
    WHERE client_id = auth.uid() 
       OR client_id IN (SELECT id FROM public.clients WHERE email = (auth.jwt() ->> 'email'))
  )
  OR public.is_admin()
)
WITH CHECK (
  project_id IN (
    SELECT id FROM public.projects 
    WHERE client_id = auth.uid() 
       OR client_id IN (SELECT id FROM public.clients WHERE email = (auth.jwt() ->> 'email'))
  )
  OR public.is_admin()
);


-- 3.7 Project Checklist Items
ALTER TABLE public.project_checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view checklist for their projects" 
ON public.project_checklist_items 
FOR SELECT 
TO authenticated 
USING (
  project_id IN (
    SELECT id FROM public.projects 
    WHERE client_id = auth.uid() 
       OR client_id IN (SELECT id FROM public.clients WHERE email = (auth.jwt() ->> 'email'))
  )
  OR public.is_admin()
);

CREATE POLICY "Admins have full access on project_checklist_items" 
ON public.project_checklist_items 
FOR ALL 
TO authenticated 
USING (public.is_admin())
WITH CHECK (public.is_admin());


-- ------------------------------------------------------------------------------
-- 4. STORAGE BUCKET SECURITY & UPLOAD CONSTRAINTS
-- ------------------------------------------------------------------------------

-- Ensure bucket exists
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-files', 'project-files', true)
ON CONFLICT (id) DO NOTHING;

-- Drop old unrestricted storage policies
DROP POLICY IF EXISTS "Allow public file uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public file access" ON storage.objects;
DROP POLICY IF EXISTS "Restricted file uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public read on project files" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete on storage files" ON storage.objects;

-- 4.1 Restricted Upload Policy (Enforces File Types & Max 25MB Size)
CREATE POLICY "Restricted file uploads" 
ON storage.objects 
FOR INSERT 
TO public, anon, authenticated 
WITH CHECK (
  bucket_id = 'project-files' 
  AND (
    LOWER(storage.extension(name)) IN ('png', 'jpg', 'jpeg', 'webp', 'svg', 'pdf', 'doc', 'docx', 'txt', 'zip')
  )
  AND (
    (metadata->>'size')::bigint <= 26214400 -- 25 MB max in bytes
    OR metadata->>'size' IS NULL
  )
);

-- 4.2 Read Policy
CREATE POLICY "Public read on project files" 
ON storage.objects 
FOR SELECT 
TO public, anon, authenticated 
USING (bucket_id = 'project-files');

-- 4.3 Delete/Update restricted strictly to Admins
CREATE POLICY "Admin delete on storage files" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'project-files' AND public.is_admin());
