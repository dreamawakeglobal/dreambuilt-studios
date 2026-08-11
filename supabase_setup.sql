-- =======================================================
-- DREAM BUILT STUDIOS: SUPABASE DATABASE SETUP SCRIPT
-- =======================================================
-- Copy and paste this script into your Supabase SQL Editor
-- (Supabase Dashboard -> SQL Editor -> New Query -> Run)

-- 1. Clean up existing tables (automatically drops any attached policies)
DROP TABLE IF EXISTS public.project_submissions CASCADE;
DROP TABLE IF EXISTS public.consultations CASCADE;

-- 2. Create Project Submissions Table
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

-- Enable Row Level Security (RLS) on project_submissions
ALTER TABLE public.project_submissions ENABLE ROW LEVEL SECURITY;

-- Allow anonymous visitors to submit forms
CREATE POLICY "Allow public form submissions" 
ON public.project_submissions 
FOR INSERT 
WITH CHECK (true);

-- Allow authenticated admin users to view submissions
CREATE POLICY "Allow admins to view submissions" 
ON public.project_submissions 
FOR SELECT 
USING (true);


-- 3. Create Consultations Table
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

-- Enable Row Level Security (RLS) on consultations
ALTER TABLE public.consultations ENABLE ROW LEVEL SECURITY;

-- Allow anonymous visitors to submit consultation requests
CREATE POLICY "Allow public consultation submissions" 
ON public.consultations 
FOR INSERT 
WITH CHECK (true);

-- Allow authenticated admin users to view consultations
CREATE POLICY "Allow admins to view consultations" 
ON public.consultations 
FOR SELECT 
USING (true);


-- 4. Enable Supabase Storage Bucket for File Uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-files', 'project-files', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public anonymous visitors to upload files into project-files bucket
DROP POLICY IF EXISTS "Allow public file uploads" ON storage.objects;
CREATE POLICY "Allow public file uploads" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'project-files');

-- Allow public viewing/downloading of project files
DROP POLICY IF EXISTS "Allow public file access" ON storage.objects;
CREATE POLICY "Allow public file access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'project-files');
