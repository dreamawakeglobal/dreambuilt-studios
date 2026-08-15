-- 02: CLIENT PORTAL & ADMIN COMMAND CENTER TABLES

DROP TABLE IF EXISTS public.project_checklist_items CASCADE;
DROP TABLE IF EXISTS public.feedback_items CASCADE;
DROP TABLE IF EXISTS public.website_pages CASCADE;
DROP TABLE IF EXISTS public.action_items CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.project_assets CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;

-- 1. Clients Table
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

-- 2. Projects Table
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  current_phase TEXT DEFAULT 'Build' NOT NULL,
  progress_pct INT DEFAULT 69 NOT NULL,
  target_launch_date TEXT DEFAULT 'Sept 15, 2026' NOT NULL,
  staging_url TEXT DEFAULT 'https://staging.dreambuiltstudios.com',
  status TEXT DEFAULT 'Active' NOT NULL
);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read/write on projects" ON public.projects FOR ALL USING (true);

-- 3. Action Items Table ("Needs Your Attention")
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
CREATE POLICY "Allow read/write on action_items" ON public.action_items FOR ALL USING (true);

-- 4. Website Pages Table (Screenshot Mockups)
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
CREATE POLICY "Allow read/write on website_pages" ON public.website_pages FOR ALL USING (true);

-- 5. Feedback Items Table (Revision Board)
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
CREATE POLICY "Allow read/write on feedback_items" ON public.feedback_items FOR ALL USING (true);

-- 6. Project Checklist Items Table
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
CREATE POLICY "Allow read/write on project_checklist_items" ON public.project_checklist_items FOR ALL USING (true);

-- 7. Real-Time Messages Table
CREATE TABLE public.messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  sender_name TEXT NOT NULL,
  message_text TEXT NOT NULL,
  time_formatted TEXT NOT NULL
);

ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow read/write on messages" ON public.messages FOR ALL USING (true);

-- 8. Asset Library Table
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
