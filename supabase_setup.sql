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

CREATE POLICY "Allow public form submissions" 
ON public.project_submissions FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admins to view submissions" 
ON public.project_submissions FOR SELECT USING (true);

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
  notes TEXT,
  status TEXT DEFAULT 'new' NOT NULL
);

ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public consultation submissions" 
ON public.consultations FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow admins to view consultations" 
ON public.consultations FOR SELECT USING (true);


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
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  password_hash TEXT DEFAULT 'demo1234' NOT NULL,
  avatar_initials TEXT DEFAULT 'AC'
);

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read/write on clients" ON public.clients FOR ALL USING (true);

-- 2.2 Create Projects Table
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  current_phase TEXT DEFAULT 'Build' NOT NULL, -- Dream, Design, Build, Review, Launch
  progress_pct INT DEFAULT 69 NOT NULL,
  target_launch_date TEXT DEFAULT 'Sept 15, 2026' NOT NULL,
  staging_url TEXT DEFAULT 'https://staging.dreambuiltstudios.com/psycortex',
  status TEXT DEFAULT 'Active' NOT NULL
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read/write on projects" ON public.projects FOR ALL USING (true);

-- 2.3 Create Action Items Table ("Needs Your Attention")
CREATE TABLE public.action_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  due_date TEXT NOT NULL,
  action_type TEXT DEFAULT 'upload_file' NOT NULL, -- upload_file, review_page, approve_milestone
  completed BOOLEAN DEFAULT false NOT NULL
);

ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read/write on action_items" ON public.action_items FOR ALL USING (true);

-- 2.4 Create Website Pages Table (Screenshot Mockups)
CREATE TABLE public.website_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL, -- Home Page, About Page, Services Page, Contact Page
  screenshot_url TEXT NOT NULL,
  version TEXT DEFAULT 'v1.0' NOT NULL,
  status TEXT DEFAULT 'Ready for Review' NOT NULL -- Ready for Review, Approved, Changes Requested
);

ALTER TABLE public.website_pages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read/write on website_pages" ON public.website_pages FOR ALL USING (true);

-- 2.5 Create Feedback Items Table (Revision Board)
CREATE TABLE public.feedback_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  page_title TEXT NOT NULL,
  title TEXT NOT NULL,
  comment TEXT NOT NULL,
  priority TEXT DEFAULT 'Normal' NOT NULL,
  status TEXT DEFAULT 'Submitted' NOT NULL -- Submitted, In Progress, Ready for Review, Completed
);

ALTER TABLE public.feedback_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read/write on feedback_items" ON public.feedback_items FOR ALL USING (true);

-- 2.6 Create Project Checklist Items Table
CREATE TABLE public.project_checklist_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  phase_name TEXT NOT NULL, -- 1. INTAKE & DISCOVERY, 2. DESIGN PHASE, 3. BUILD PHASE, 4. REVIEW PHASE, 5. LAUNCH PHASE
  title TEXT NOT NULL,
  owner TEXT DEFAULT 'Dream Built' NOT NULL, -- Dream Built, Client Action
  status TEXT DEFAULT 'Upcoming' NOT NULL -- Completed, In Progress, Action Required, Upcoming
);

ALTER TABLE public.project_checklist_items ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read/write on project_checklist_items" ON public.project_checklist_items FOR ALL USING (true);

-- 2.7 Create Real-Time Messages Table
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL, -- Dream Built, Client Contact Name
  message_text TEXT NOT NULL,
  time_formatted TEXT NOT NULL
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read/write on messages" ON public.messages FOR ALL USING (true);

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
CREATE POLICY "Allow read/write on project_assets" ON public.project_assets FOR ALL USING (true);


-- -------------------------------------------------------
-- SECTION 3: STORAGE BUCKET & FILE PERMISSIONS
-- -------------------------------------------------------

INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-files', 'project-files', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow public file uploads" ON storage.objects;
CREATE POLICY "Allow public file uploads" 
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-files');

DROP POLICY IF EXISTS "Allow public file access" ON storage.objects;
CREATE POLICY "Allow public file access" 
ON storage.objects FOR SELECT USING (bucket_id = 'project-files');


-- -------------------------------------------------------
-- SECTION 4: SEED DEMO DATA (Psycortex Workspace)
-- -------------------------------------------------------

INSERT INTO public.clients (id, business_name, contact_name, email, phone, avatar_initials)
VALUES ('11111111-1111-1111-1111-111111111111', 'Psycortex', 'Alba Cortez', 'alba@psycortex.com', '(555) 234-5678', 'AC')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.projects (id, client_id, project_name, current_phase, progress_pct, target_launch_date, status)
VALUES ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Psycortex Corporate Website', 'Build', 52, 'Sept 15, 2026', 'Active')
ON CONFLICT (id) DO NOTHING;

-- Seed Psycortex 21-Item Checklist
INSERT INTO public.project_checklist_items (project_id, phase_name, title, owner, status) VALUES
('22222222-2222-2222-2222-222222222222', '1. INTAKE & DISCOVERY', 'Initial client consultation and requirements gathering', 'Dream Built', 'Completed'),
('22222222-2222-2222-2222-222222222222', '1. INTAKE & DISCOVERY', 'Target audience and market research (El Salvador corporate focus)', 'Dream Built', 'Completed'),
('22222222-2222-2222-2222-222222222222', '1. INTAKE & DISCOVERY', 'Defining brand identity (Premium, Deep Blue, Gold)', 'Dream Built', 'Completed'),
('22222222-2222-2222-2222-222222222222', '1. INTAKE & DISCOVERY', 'Outlining site architecture (Home, About, Services, Packages, Contact)', 'Dream Built', 'Completed'),
('22222222-2222-2222-2222-222222222222', '2. DESIGN PHASE', 'UI/UX layout planning', 'Dream Built', 'Completed'),
('22222222-2222-2222-2222-222222222222', '2. DESIGN PHASE', 'Selecting modern typography and visual elements', 'Dream Built', 'Completed'),
('22222222-2222-2222-2222-222222222222', '2. DESIGN PHASE', 'Designing custom UI components (metallic gold gradients, glow effects)', 'Dream Built', 'Completed'),
('22222222-2222-2222-2222-222222222222', '2. DESIGN PHASE', 'Drafting localized copy and service structures', 'Dream Built', 'Completed'),
('22222222-2222-2222-2222-222222222222', '3. BUILD PHASE', 'Developing HTML structure and semantic markup', 'Dream Built', 'Completed'),
('22222222-2222-2222-2222-222222222222', '3. BUILD PHASE', 'Implementing CSS styling and responsive mobile layouts', 'Dream Built', 'Completed'),
('22222222-2222-2222-2222-222222222222', '3. BUILD PHASE', 'Refining package features, monthly structures, and pricing models', 'Dream Built', 'Completed'),
('22222222-2222-2222-2222-222222222222', '3. BUILD PHASE', 'Adding social media links (LinkedIn, Instagram, TikTok)', 'Dream Built', 'In Progress'),
('22222222-2222-2222-2222-222222222222', '3. BUILD PHASE', 'Finalizing interactive elements and form functionality', 'Dream Built', 'In Progress'),
('22222222-2222-2222-2222-222222222222', '4. REVIEW PHASE', 'Cross-browser and mobile device testing', 'Dream Built', 'Upcoming'),
('22222222-2222-2222-2222-222222222222', '4. REVIEW PHASE', 'Proofreading Spanish copy and checking grammar/accents', 'Client Action', 'Upcoming'),
('22222222-2222-2222-2222-222222222222', '4. REVIEW PHASE', 'Testing all links, forms, and widgets for proper functionality', 'Dream Built', 'Upcoming'),
('22222222-2222-2222-2222-222222222222', '4. REVIEW PHASE', 'Client review and final feedback rounds', 'Client Action', 'Upcoming'),
('22222222-2222-2222-2222-222222222222', '5. LAUNCH PHASE', 'Final performance optimization and cache busting', 'Dream Built', 'Upcoming'),
('22222222-2222-2222-2222-222222222222', '5. LAUNCH PHASE', 'Configuring domain and hosting deployment', 'Dream Built', 'Upcoming'),
('22222222-2222-2222-2222-222222222222', '5. LAUNCH PHASE', 'SEO metadata implementation (titles, descriptions)', 'Dream Built', 'Upcoming'),
('22222222-2222-2222-2222-222222222222', '5. LAUNCH PHASE', 'Post-launch monitoring and client hand-off', 'Dream Built', 'Upcoming');
