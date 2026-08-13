-- =======================================================
-- DREAM BUILT STUDIOS: CLIENT PORTAL V1 DATABASE SCHEMA & RLS
-- =======================================================
-- Copy and paste this script into your Supabase SQL Editor
-- (Supabase Dashboard -> SQL Editor -> New Query -> Run)

-- 1. CLEANUP (Safely drop existing portal tables if re-running)
DROP TABLE IF EXISTS public.activity_log CASCADE;
DROP TABLE IF EXISTS public.project_links CASCADE;
DROP TABLE IF EXISTS public.project_updates CASCADE;
DROP TABLE IF EXISTS public.project_messages CASCADE;
DROP TABLE IF EXISTS public.approvals CASCADE;
DROP TABLE IF EXISTS public.files CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.feedback_requests CASCADE;
DROP TABLE IF EXISTS public.website_pages CASCADE;
DROP TABLE IF EXISTS public.action_items CASCADE;
DROP TABLE IF EXISTS public.milestones CASCADE;
DROP TABLE IF EXISTS public.project_phases CASCADE;
DROP TABLE IF EXISTS public.project_members CASCADE;
DROP TABLE IF EXISTS public.projects CASCADE;
DROP TABLE IF EXISTS public.clients CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- 2. CREATE CORE TABLES

-- USERS Table (Extends auth.users)
CREATE TABLE public.users (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  avatar_url TEXT,
  role TEXT DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- CLIENTS Table
CREATE TABLE public.clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_name TEXT NOT NULL,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  website TEXT,
  logo_url TEXT,
  status TEXT DEFAULT 'active' NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- PROJECTS Table
CREATE TABLE public.projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  project_type TEXT DEFAULT 'Custom Website Design & Build',
  status TEXT DEFAULT 'Active' NOT NULL,
  current_phase TEXT DEFAULT 'Build' NOT NULL,
  progress_percentage INTEGER DEFAULT 0 CHECK (progress_percentage BETWEEN 0 AND 100),
  start_date DATE,
  target_launch_date DATE,
  preview_url TEXT,
  production_url TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- PROJECT MEMBERS Table (Links authorized Users to authorized Projects)
CREATE TABLE public.project_members (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  role TEXT DEFAULT 'client' CHECK (role IN ('admin', 'client')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  UNIQUE(project_id, user_id)
);

-- PROJECT PHASES Table
CREATE TABLE public.project_phases (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  order_index INTEGER NOT NULL,
  status TEXT DEFAULT 'Upcoming' CHECK (status IN ('Completed', 'Current', 'Upcoming')),
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  UNIQUE(project_id, name)
);

-- MILESTONES Table
CREATE TABLE public.milestones (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  due_date DATE,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Completed')),
  completed_at TIMESTAMPTZ
);

-- ACTION ITEMS / TASKS Table
CREATE TABLE public.action_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  assigned_to UUID REFERENCES public.users(id) ON DELETE SET NULL,
  assigned_role TEXT DEFAULT 'client' CHECK (assigned_role IN ('admin', 'client')),
  due_date DATE,
  priority TEXT DEFAULT 'Normal' CHECK (priority IN ('Normal', 'Important', 'Urgent')),
  status TEXT DEFAULT 'Action Required' CHECK (status IN ('Not Started', 'In Progress', 'Waiting on Client', 'Waiting on Dream Built', 'Action Required', 'Completed')),
  action_type TEXT DEFAULT 'custom',
  target_entity_id UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  completed_at TIMESTAMPTZ
);

-- WEBSITE PAGES Table
CREATE TABLE public.website_pages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  page_name TEXT NOT NULL,
  page_slug TEXT NOT NULL,
  status TEXT DEFAULT 'Planned' CHECK (status IN ('Planned', 'Designing', 'Building', 'Ready for Review', 'Changes Requested', 'Approved', 'Complete')),
  preview_url TEXT,
  version TEXT DEFAULT '1.0',
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- FEEDBACK REQUESTS Table
CREATE TABLE public.feedback_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  website_page_id UUID REFERENCES public.website_pages(id) ON DELETE SET NULL,
  submitted_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  section_name TEXT,
  description TEXT NOT NULL,
  priority TEXT DEFAULT 'Normal' CHECK (priority IN ('Normal', 'Important')),
  status TEXT DEFAULT 'Submitted' CHECK (status IN ('Submitted', 'Under Review', 'In Progress', 'Ready for Review', 'Completed', 'Closed')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  completed_at TIMESTAMPTZ
);

-- COMMENTS Table (Threaded Feedback Discussions)
CREATE TABLE public.comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  feedback_request_id UUID REFERENCES public.feedback_requests(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- FILES Table
CREATE TABLE public.files (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  uploaded_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  category TEXT DEFAULT 'Other' CHECK (category IN ('Logo', 'Brand Assets', 'Photos', 'Website Copy', 'Inspiration', 'Documents', 'Product Images', 'Other')),
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- APPROVALS Table
CREATE TABLE public.approvals (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  website_page_id UUID REFERENCES public.website_pages(id) ON DELETE CASCADE NOT NULL,
  requested_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'Pending' CHECK (status IN ('Pending', 'Approved', 'Changes Requested')),
  version TEXT,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  approved_at TIMESTAMPTZ
);

-- PROJECT MESSAGES Table
CREATE TABLE public.project_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  edited_at TIMESTAMPTZ
);

-- PROJECT UPDATES Table
CREATE TABLE public.project_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  created_by UUID REFERENCES public.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- PROJECT LINKS Table
CREATE TABLE public.project_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  label TEXT NOT NULL,
  url TEXT NOT NULL,
  category TEXT,
  client_visible BOOLEAN DEFAULT true NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- ACTIVITY LOG Table
CREATE TABLE public.activity_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action_type TEXT NOT NULL,
  description TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- 3. HELPER FUNCTIONS & RLS POLICIES

-- Helper to check if current authenticated user is an admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable RLS on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.action_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.website_pages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.approvals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_log ENABLE ROW LEVEL SECURITY;

-- POLICIES FOR USERS
CREATE POLICY "Admins have full access to users" ON public.users FOR ALL USING (public.is_admin());
CREATE POLICY "Users can view their own profile" ON public.users FOR SELECT USING (id = auth.uid());

-- POLICIES FOR CLIENTS
CREATE POLICY "Admins have full access to clients" ON public.clients FOR ALL USING (public.is_admin());
CREATE POLICY "Clients can view their own client record" ON public.clients FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.projects p
    JOIN public.project_members pm ON pm.project_id = p.id
    WHERE p.client_id = clients.id AND pm.user_id = auth.uid()
  )
);

-- POLICIES FOR PROJECTS
CREATE POLICY "Admins have full access to projects" ON public.projects FOR ALL USING (public.is_admin());
CREATE POLICY "Clients can view authorized projects" ON public.projects FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.project_members pm
    WHERE pm.project_id = projects.id AND pm.user_id = auth.uid()
  )
);

-- POLICIES FOR PROJECT MEMBERS
CREATE POLICY "Admins have full access to project_members" ON public.project_members FOR ALL USING (public.is_admin());
CREATE POLICY "Users can view their membership" ON public.project_members FOR SELECT USING (user_id = auth.uid());

-- MACRO HELPER POLICY CLAUSE: User belongs to project
CREATE OR REPLACE FUNCTION public.user_belongs_to_project(p_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN public.is_admin() OR EXISTS (
    SELECT 1 FROM public.project_members
    WHERE project_id = p_id AND user_id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- POLICIES FOR PROJECT PHASES
CREATE POLICY "Full access for admins on phases" ON public.project_phases FOR ALL USING (public.is_admin());
CREATE POLICY "Clients can view authorized project phases" ON public.project_phases FOR SELECT USING (public.user_belongs_to_project(project_id));

-- POLICIES FOR MILESTONES
CREATE POLICY "Full access for admins on milestones" ON public.milestones FOR ALL USING (public.is_admin());
CREATE POLICY "Clients can view authorized milestones" ON public.milestones FOR SELECT USING (public.user_belongs_to_project(project_id));

-- POLICIES FOR ACTION ITEMS
CREATE POLICY "Full access for admins on action_items" ON public.action_items FOR ALL USING (public.is_admin());
CREATE POLICY "Clients can view authorized action_items" ON public.action_items FOR SELECT USING (public.user_belongs_to_project(project_id));
CREATE POLICY "Clients can update assigned action_items" ON public.action_items FOR UPDATE USING (public.user_belongs_to_project(project_id));

-- POLICIES FOR WEBSITE PAGES
CREATE POLICY "Full access for admins on website_pages" ON public.website_pages FOR ALL USING (public.is_admin());
CREATE POLICY "Clients can view authorized website_pages" ON public.website_pages FOR SELECT USING (public.user_belongs_to_project(project_id));

-- POLICIES FOR FEEDBACK REQUESTS
CREATE POLICY "Full access for admins on feedback" ON public.feedback_requests FOR ALL USING (public.is_admin());
CREATE POLICY "Clients can view authorized feedback" ON public.feedback_requests FOR SELECT USING (public.user_belongs_to_project(project_id));
CREATE POLICY "Clients can insert feedback" ON public.feedback_requests FOR INSERT WITH CHECK (public.user_belongs_to_project(project_id));
CREATE POLICY "Clients can update feedback" ON public.feedback_requests FOR UPDATE USING (public.user_belongs_to_project(project_id));

-- POLICIES FOR COMMENTS
CREATE POLICY "Full access for admins on comments" ON public.comments FOR ALL USING (public.is_admin());
CREATE POLICY "Clients can view feedback comments" ON public.comments FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.feedback_requests fr
    WHERE fr.id = comments.feedback_request_id AND public.user_belongs_to_project(fr.project_id)
  )
);
CREATE POLICY "Clients can insert comments" ON public.comments FOR INSERT WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.feedback_requests fr
    WHERE fr.id = comments.feedback_request_id AND public.user_belongs_to_project(fr.project_id)
  )
);

-- POLICIES FOR FILES
CREATE POLICY "Full access for admins on files" ON public.files FOR ALL USING (public.is_admin());
CREATE POLICY "Clients can view authorized files" ON public.files FOR SELECT USING (public.user_belongs_to_project(project_id));
CREATE POLICY "Clients can upload files" ON public.files FOR INSERT WITH CHECK (public.user_belongs_to_project(project_id));

-- POLICIES FOR APPROVALS
CREATE POLICY "Full access for admins on approvals" ON public.approvals FOR ALL USING (public.is_admin());
CREATE POLICY "Clients can view authorized approvals" ON public.approvals FOR SELECT USING (public.user_belongs_to_project(project_id));
CREATE POLICY "Clients can update approvals" ON public.approvals FOR UPDATE USING (public.user_belongs_to_project(project_id));

-- POLICIES FOR MESSAGES
CREATE POLICY "Full access for admins on messages" ON public.project_messages FOR ALL USING (public.is_admin());
CREATE POLICY "Clients can view authorized messages" ON public.project_messages FOR SELECT USING (public.user_belongs_to_project(project_id));
CREATE POLICY "Clients can send messages" ON public.project_messages FOR INSERT WITH CHECK (public.user_belongs_to_project(project_id));

-- POLICIES FOR PROJECT UPDATES
CREATE POLICY "Full access for admins on updates" ON public.project_updates FOR ALL USING (public.is_admin());
CREATE POLICY "Clients can view updates" ON public.project_updates FOR SELECT USING (public.user_belongs_to_project(project_id));

-- POLICIES FOR PROJECT LINKS
CREATE POLICY "Full access for admins on links" ON public.project_links FOR ALL USING (public.is_admin());
CREATE POLICY "Clients can view links" ON public.project_links FOR SELECT USING (public.user_belongs_to_project(project_id) AND client_visible = true);

-- POLICIES FOR ACTIVITY LOG
CREATE POLICY "Full access for admins on activity_log" ON public.activity_log FOR ALL USING (public.is_admin());
CREATE POLICY "Clients can view activity" ON public.activity_log FOR SELECT USING (public.user_belongs_to_project(project_id));

-- 4. STORAGE BUCKET FOR PORTAL FILES
INSERT INTO storage.buckets (id, name, public)
VALUES ('portal-files', 'portal-files', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Portal file upload policy" ON storage.objects;
CREATE POLICY "Portal file upload policy" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'portal-files');

DROP POLICY IF EXISTS "Portal file access policy" ON storage.objects;
CREATE POLICY "Portal file access policy" ON storage.objects
FOR SELECT USING (bucket_id = 'portal-files');
