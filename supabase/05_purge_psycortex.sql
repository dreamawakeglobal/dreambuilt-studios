-- ====================================================================
-- DREAM BUILT STUDIOS - PURGE ALL LEGACY PSYCORTEX ACCOUNTS & DATA
-- ====================================================================

-- Delete all checklist items linked to Psycortex projects
DELETE FROM public.project_checklist_items 
WHERE project_id IN (
  SELECT id FROM public.projects 
  WHERE LOWER(client_email) LIKE '%psycortex%' 
     OR LOWER(project_name) LIKE '%psycortex%'
);

-- Delete all action items linked to Psycortex projects
DELETE FROM public.action_items 
WHERE project_id IN (
  SELECT id FROM public.projects 
  WHERE LOWER(client_email) LIKE '%psycortex%' 
     OR LOWER(project_name) LIKE '%psycortex%'
);

-- Delete all website pages linked to Psycortex projects
DELETE FROM public.website_pages 
WHERE project_id IN (
  SELECT id FROM public.projects 
  WHERE LOWER(client_email) LIKE '%psycortex%' 
     OR LOWER(project_name) LIKE '%psycortex%'
);

-- Delete all feedback items linked to Psycortex projects
DELETE FROM public.feedback_items 
WHERE project_id IN (
  SELECT id FROM public.projects 
  WHERE LOWER(client_email) LIKE '%psycortex%' 
     OR LOWER(project_name) LIKE '%psycortex%'
);

-- Delete all chat messages linked to Psycortex projects
DELETE FROM public.messages 
WHERE project_id IN (
  SELECT id FROM public.projects 
  WHERE LOWER(client_email) LIKE '%psycortex%' 
     OR LOWER(project_name) LIKE '%psycortex%'
);

-- Delete all project assets linked to Psycortex projects
DELETE FROM public.project_assets 
WHERE project_id IN (
  SELECT id FROM public.projects 
  WHERE LOWER(client_email) LIKE '%psycortex%' 
     OR LOWER(project_name) LIKE '%psycortex%'
);

-- Delete all Psycortex projects
DELETE FROM public.projects 
WHERE LOWER(client_email) LIKE '%psycortex%' 
   OR LOWER(project_name) LIKE '%psycortex%';

-- Delete all Psycortex clients
DELETE FROM public.clients 
WHERE LOWER(email) LIKE '%psycortex%' 
   OR LOWER(business_name) LIKE '%psycortex%';
