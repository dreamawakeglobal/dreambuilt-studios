-- ===================================================
-- SUPABASE SCHEMA MIGRATION: CLEAN REBUILD (06)
-- Single Source of Truth for Clients, Projects & Assets
-- ===================================================

-- 1. DROP EXISTING TABLES IN REVERSE DEPENDENCY ORDER
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.feedback_items CASCADE;
DROP TABLE IF EXISTS public.action_items CASCADE;
DROP TABLE IF EXISTS public.website_pages CASCADE;
DROP TABLE IF EXISTS public.project_assets CASCADE;
DROP TABLE IF EXISTS public.project_checklist_items CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;

-- 2. CLIENTS TABLE
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  avatar_initials TEXT DEFAULT 'DB',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROJECTS TABLE (Cascading delete on client deletion)
CREATE TABLE public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  current_phase TEXT DEFAULT 'Build',
  progress_pct INTEGER DEFAULT 0,
  target_launch_date TEXT DEFAULT 'Upcoming',
  status TEXT DEFAULT 'Active',
  staging_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. WEBSITE PAGES TABLE (Cascading delete on project deletion)
CREATE TABLE public.website_pages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  screenshot_url TEXT NOT NULL,
  version TEXT DEFAULT 'v1.0',
  status TEXT DEFAULT 'Ready for Review',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ACTION ITEMS TABLE
CREATE TABLE public.action_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  due_date TEXT DEFAULT 'Soon',
  action_type TEXT DEFAULT 'upload_file',
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. FEEDBACK ITEMS TABLE
CREATE TABLE public.feedback_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  page_title TEXT DEFAULT 'Home Page',
  section TEXT DEFAULT 'Design Screenshot',
  comment TEXT NOT NULL,
  status TEXT DEFAULT 'Submitted',
  priority TEXT DEFAULT 'Normal',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. MESSAGES TABLE
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  sender_role TEXT DEFAULT 'Client',
  sender_name TEXT NOT NULL,
  message_text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. PROJECT CHECKLIST ITEMS TABLE
CREATE TABLE public.project_checklist_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE,
  phase_name TEXT NOT NULL,
  item_title TEXT NOT NULL,
  owner TEXT DEFAULT 'Dream Built',
  status TEXT DEFAULT 'Upcoming',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. ENABLE ROW LEVEL SECURITY & OPEN ACCESS POLICIES
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Open read/write for clients" ON public.clients FOR ALL USING (true);
CREATE POLICY "Open read/write for projects" ON public.projects FOR ALL USING (true);
CREATE POLICY "Open read/write for website_pages" ON public.website_pages FOR ALL USING (true);
CREATE POLICY "Open read/write for action_items" ON public.action_items FOR ALL USING (true);
CREATE POLICY "Open read/write for feedback_items" ON public.feedback_items FOR ALL USING (true);
CREATE POLICY "Open read/write for messages" ON public.messages FOR ALL USING (true);
CREATE POLICY "Open read/write for project_checklist_items" ON public.project_checklist_items FOR ALL USING (true);

-- 10. SEED INITIAL CLIENT ACCOUNTS & PROJECTS
INSERT INTO public.clients (id, business_name, contact_name, email, password_hash, avatar_initials)
VALUES 
  ('2fa789ce-05be-48f8-bbc4-5d33e4912186', 'Psycortex', 'Alba Cortez', 'psycortex@dbstudios.com', 'DreamPsycortex2026!', 'AC'),
  ('fcfc65cf-eee2-4be7-bd06-f13b2cafe30b', 'Decipher', 'Dontae Jeffery', 'decipher@dbstudios.com', 'DreamDecipher2026!', 'DJ');

INSERT INTO public.projects (id, client_id, project_name, current_phase, progress_pct, target_launch_date, status)
VALUES 
  ('9af4a1fe-529a-4467-ab80-087f0e034157', '2fa789ce-05be-48f8-bbc4-5d33e4912186', 'Psycortex Corporate', 'Build', 50, 'Aug 24, 2026', 'Active'),
  ('f4403861-c591-40a9-b1ac-f442550c79c9', 'fcfc65cf-eee2-4be7-bd06-f13b2cafe30b', 'Decipher Corporate Web Platform', 'Build', 60, 'Sept 15, 2026', 'Active');
