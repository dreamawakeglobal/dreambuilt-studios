-- =======================================================
-- DREAM BUILT STUDIOS: COMPLETE MASTER SUPABASE DATABASE SETUP
-- =======================================================
-- Copy and paste this ENTIRE script into your Supabase SQL Editor:
-- (Supabase Dashboard -> SQL Editor -> New Query -> Run)
-- =======================================================

-- -------------------------------------------------------
-- SECTION 1: PUBLIC INTAKE & CONSULTATION FORM TABLES
-- -------------------------------------------------------

-- 1.1 Clean up existing tables
DROP TABLE IF EXISTS public.project_submissions CASCADE;
DROP TABLE IF EXISTS public.consultations CASCADE;

-- 1.2 Create Project Submissions Table
CREATE TABLE public.project_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  building TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  company TEXT NOT NULL,
  website TEXT,
  industry TEXT NOT NULL,
  target_audience TEXT NOT NULL,
  project_desc TEXT NOT NULL,
  aesthetic_style TEXT,
  brand_colors TEXT,
  primary_cta TEXT,
  inspiration_urls TEXT,
  headline_text TEXT,
  pages TEXT NOT NULL,
  features TEXT,
  budget TEXT NOT NULL,
  timeline TEXT NOT NULL,
  success_criteria TEXT NOT NULL,
  files TEXT,
  status TEXT DEFAULT 'new' NOT NULL
);

ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public insert only for project_submissions" 
ON public.project_submissions FOR INSERT 
TO public, anon, authenticated 
WITH CHECK (true);

CREATE POLICY "Admin full access on project_submissions" 
ON public.project_submissions FOR ALL 
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

-- 1.3 Create Consultations Table
CREATE TABLE public.consultations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  consultation_type TEXT,
  consultation_date DATE,
  consultation_time TEXT,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  company TEXT,
  website TEXT,
  business_type TEXT,
  what_to_build TEXT,
  has_website TEXT,
  primary_goal TEXT,
  features TEXT,
  budget TEXT,
  timeline TEXT,
  vision TEXT,
  notes TEXT,
  status TEXT DEFAULT 'new' NOT NULL
);

ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public insert only for consultations" 
ON public.consultations FOR INSERT 
TO public, anon, authenticated 
WITH CHECK (true);

CREATE POLICY "Admin full access on consultations" 
ON public.consultations FOR ALL 
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


-- -------------------------------------------------------
-- SECTION 2: CLIENT PORTAL & ADMIN COMMAND CENTER TABLES
-- -------------------------------------------------------

DROP TABLE IF EXISTS public.project_checklist_items CASCADE;
DROP TABLE IF EXISTS public.feedback_items CASCADE;
DROP TABLE IF EXISTS public.website_pages CASCADE;
DROP TABLE IF EXISTS public.action_items CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.project_assets CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;

-- 2.1 Create Clients Table
CREATE TABLE public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  avatar_initials TEXT DEFAULT 'DB'
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view their own profile" 
ON public.clients FOR SELECT TO authenticated 
USING (
  user_id = auth.uid() 
  OR email = (auth.jwt() ->> 'email')
  OR (auth.jwt() ->> 'email') ILIKE '%@dreambuiltstudios.com'
);

CREATE POLICY "Admins have full access on clients" 
ON public.clients FOR ALL TO authenticated 
USING (
  (auth.jwt() ->> 'email') ILIKE '%@dreambuiltstudios.com'
  OR (auth.jwt() ->> 'email') = 'admin@dreambuiltstudios.com'
  OR (auth.jwt() ->> 'email') = 'tariq@dreambuiltstudios.com'
);

-- 2.2 Create Projects Table
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  current_phase TEXT DEFAULT 'Build' NOT NULL, -- Dream, Design, Build, Review, Launch
  progress_pct INT DEFAULT 69 NOT NULL,
  target_launch_date TEXT DEFAULT 'Sept 15, 2026' NOT NULL,
  staging_url TEXT DEFAULT 'https://staging.dreambuiltstudios.com',
  status TEXT DEFAULT 'Active' NOT NULL
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view their own projects" 
ON public.projects FOR SELECT TO authenticated 
USING (
  client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid() OR email = (auth.jwt() ->> 'email'))
  OR (auth.jwt() ->> 'email') ILIKE '%@dreambuiltstudios.com'
);

CREATE POLICY "Admins have full access on projects" 
ON public.projects FOR ALL TO authenticated 
USING (
  (auth.jwt() ->> 'email') ILIKE '%@dreambuiltstudios.com'
  OR (auth.jwt() ->> 'email') = 'admin@dreambuiltstudios.com'
  OR (auth.jwt() ->> 'email') = 'tariq@dreambuiltstudios.com'
);

-- 2.3 Create Action Items Table ("Needs Your Attention")
CREATE TABLE public.action_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  due_date TEXT NOT NULL,
  action_type TEXT DEFAULT 'upload_file' NOT NULL,
  completed BOOLEAN DEFAULT false NOT NULL
);

ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can manage action items on their projects" 
ON public.action_items FOR ALL TO authenticated 
USING (
  project_id IN (
    SELECT id FROM public.projects 
    WHERE client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid() OR email = (auth.jwt() ->> 'email'))
  )
  OR (auth.jwt() ->> 'email') ILIKE '%@dreambuiltstudios.com'
);

-- 2.4 Create Website Pages Table (Screenshot Mockups)
CREATE TABLE public.website_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  screenshot_url TEXT NOT NULL,
  version TEXT DEFAULT 'v1.0' NOT NULL,
  status TEXT DEFAULT 'Ready for Review' NOT NULL
);

ALTER TABLE public.website_pages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view pages for their projects" 
ON public.website_pages FOR SELECT TO authenticated 
USING (
  project_id IN (
    SELECT id FROM public.projects 
    WHERE client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid() OR email = (auth.jwt() ->> 'email'))
  )
  OR (auth.jwt() ->> 'email') ILIKE '%@dreambuiltstudios.com'
);

CREATE POLICY "Admins have full access on website_pages" 
ON public.website_pages FOR ALL TO authenticated 
USING (
  (auth.jwt() ->> 'email') ILIKE '%@dreambuiltstudios.com'
  OR (auth.jwt() ->> 'email') = 'admin@dreambuiltstudios.com'
  OR (auth.jwt() ->> 'email') = 'tariq@dreambuiltstudios.com'
);

-- 2.5 Create Feedback Items Table (Revision Board)
CREATE TABLE public.feedback_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  page_title TEXT NOT NULL,
  title TEXT NOT NULL,
  comment TEXT NOT NULL,
  priority TEXT DEFAULT 'Normal' NOT NULL,
  status TEXT DEFAULT 'Submitted' NOT NULL
);

ALTER TABLE public.feedback_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can manage feedback on their projects" 
ON public.feedback_items FOR ALL TO authenticated 
USING (
  project_id IN (
    SELECT id FROM public.projects 
    WHERE client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid() OR email = (auth.jwt() ->> 'email'))
  )
  OR (auth.jwt() ->> 'email') ILIKE '%@dreambuiltstudios.com'
);

-- 2.6 Create Project Checklist Items Table
CREATE TABLE public.project_checklist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  phase_name TEXT NOT NULL,
  title TEXT NOT NULL,
  owner TEXT DEFAULT 'Dream Built' NOT NULL,
  status TEXT DEFAULT 'Upcoming' NOT NULL
);

ALTER TABLE public.project_checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view checklist for their projects" 
ON public.project_checklist_items FOR SELECT TO authenticated 
USING (
  project_id IN (
    SELECT id FROM public.projects 
    WHERE client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid() OR email = (auth.jwt() ->> 'email'))
  )
  OR (auth.jwt() ->> 'email') ILIKE '%@dreambuiltstudios.com'
);

CREATE POLICY "Admins have full access on project_checklist_items" 
ON public.project_checklist_items FOR ALL TO authenticated 
USING (
  (auth.jwt() ->> 'email') ILIKE '%@dreambuiltstudios.com'
  OR (auth.jwt() ->> 'email') = 'admin@dreambuiltstudios.com'
  OR (auth.jwt() ->> 'email') = 'tariq@dreambuiltstudios.com'
);

-- 2.7 Create Real-Time Messages Table
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  message_text TEXT NOT NULL,
  time_formatted TEXT NOT NULL
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view and send messages on their projects" 
ON public.messages FOR ALL TO authenticated 
USING (
  project_id IN (
    SELECT id FROM public.projects 
    WHERE client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid() OR email = (auth.jwt() ->> 'email'))
  )
  OR (auth.jwt() ->> 'email') ILIKE '%@dreambuiltstudios.com'
);

-- 2.8 Create Asset Library Table
CREATE TABLE public.project_assets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size TEXT NOT NULL,
  file_type TEXT NOT NULL
);

ALTER TABLE public.project_assets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Clients can view assets on their projects" 
ON public.project_assets FOR SELECT TO authenticated 
USING (
  project_id IN (
    SELECT id FROM public.projects 
    WHERE client_id IN (SELECT id FROM public.clients WHERE user_id = auth.uid() OR email = (auth.jwt() ->> 'email'))
  )
  OR (auth.jwt() ->> 'email') ILIKE '%@dreambuiltstudios.com'
);


-- -------------------------------------------------------
-- SECTION 3: STORAGE BUCKET & FILE PERMISSIONS
-- -------------------------------------------------------

INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-files', 'project-files', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow public file uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow public file access" ON storage.objects;
DROP POLICY IF EXISTS "Restricted file uploads" ON storage.objects;
DROP POLICY IF EXISTS "Public read on project files" ON storage.objects;
DROP POLICY IF EXISTS "Admin delete on storage files" ON storage.objects;

CREATE POLICY "Restricted file uploads" 
ON storage.objects FOR INSERT 
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

CREATE POLICY "Public read on project files" 
ON storage.objects FOR SELECT 
TO public, anon, authenticated 
USING (bucket_id = 'project-files');

CREATE POLICY "Admin delete on storage files" 
ON storage.objects FOR DELETE 
TO authenticated 
USING (
  bucket_id = 'project-files' 
  AND (
    (auth.jwt() ->> 'email') ILIKE '%@dreambuiltstudios.com'
    OR (auth.jwt() ->> 'email') = 'admin@dreambuiltstudios.com'
    OR (auth.jwt() ->> 'email') = 'tariq@dreambuiltstudios.com'
  )
);


-- -------------------------------------------------------
-- SECTION 4: AUTOMATIC SERVER-SIDE CHECKLIST TRIGGER
-- -------------------------------------------------------
CREATE OR REPLACE FUNCTION public.seed_project_checklist()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.project_checklist_items (project_id, phase_name, title, owner, status) VALUES
  (NEW.id, '1. INTAKE & DISCOVERY', 'Initial client consultation and requirements gathering', 'Dream Built', 'Upcoming'),
  (NEW.id, '1. INTAKE & DISCOVERY', 'Target audience and market research (Corporate & Startups)', 'Dream Built', 'Upcoming'),
  (NEW.id, '1. INTAKE & DISCOVERY', 'Defining brand identity (Modern, Deep Blue, Glow)', 'Dream Built', 'Upcoming'),
  (NEW.id, '1. INTAKE & DISCOVERY', 'Outlining site architecture (Home, Pricing, Services, Contact)', 'Dream Built', 'Upcoming'),
  (NEW.id, '2. DESIGN PHASE', 'UI/UX layout planning & responsive wireframes', 'Dream Built', 'Upcoming'),
  (NEW.id, '2. DESIGN PHASE', 'Selecting modern typography and visual elements', 'Dream Built', 'Upcoming'),
  (NEW.id, '2. DESIGN PHASE', 'Designing custom UI components (metallic gradients, glow effects)', 'Dream Built', 'Upcoming'),
  (NEW.id, '2. DESIGN PHASE', 'Drafting localized copy and service structures', 'Dream Built', 'Upcoming'),
  (NEW.id, '3. BUILD PHASE', 'Developing HTML structure and semantic markup', 'Dream Built', 'Upcoming'),
  (NEW.id, '3. BUILD PHASE', 'Implementing CSS styling and responsive mobile layouts', 'Dream Built', 'Upcoming'),
  (NEW.id, '3. BUILD PHASE', 'Refining package features, add-ons, and pricing calculator', 'Dream Built', 'Upcoming'),
  (NEW.id, '3. BUILD PHASE', 'Adding interactive elements and form validation', 'Dream Built', 'Upcoming'),
  (NEW.id, '4. REVIEW PHASE', 'Cross-browser and mobile device QA testing', 'Dream Built', 'Upcoming'),
  (NEW.id, '4. REVIEW PHASE', 'Testing all links, forms, and widgets for proper functionality', 'Dream Built', 'Upcoming'),
  (NEW.id, '4. REVIEW PHASE', 'Client review and final feedback rounds', 'Client Action', 'Upcoming'),
  (NEW.id, '5. LAUNCH PHASE', 'Final performance optimization and asset caching', 'Dream Built', 'Upcoming'),
  (NEW.id, '5. LAUNCH PHASE', 'Configuring domain and hosting deployment', 'Dream Built', 'Upcoming'),
  (NEW.id, '5. LAUNCH PHASE', 'SEO metadata implementation (titles, descriptions, schema)', 'Dream Built', 'Upcoming'),
  (NEW.id, '5. LAUNCH PHASE', 'Post-launch monitoring and client hand-off', 'Dream Built', 'Upcoming');
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_seed_project_checklist ON public.projects;
CREATE TRIGGER trigger_seed_project_checklist
  AFTER INSERT ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.seed_project_checklist();
