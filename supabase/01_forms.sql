-- 01: PUBLIC INTAKE & CONSULTATION FORM TABLES

DROP TABLE IF EXISTS public.project_submissions CASCADE;
DROP TABLE IF EXISTS public.consultations CASCADE;

-- 1. Project Submissions Table (Intake Wizard Submissions)
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
CREATE POLICY "Allow public form submissions" ON public.project_submissions FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admins to view submissions" ON public.project_submissions FOR SELECT USING (true);

-- 2. Consultations Table (Book Consultation Submissions)
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
CREATE POLICY "Allow public consultation submissions" ON public.consultations FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow admins to view consultations" ON public.consultations FOR SELECT USING (true);
