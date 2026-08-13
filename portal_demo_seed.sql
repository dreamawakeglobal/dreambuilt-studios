-- =======================================================
-- DREAM BUILT STUDIOS: CLIENT PORTAL DEMO SEED DATA
-- =======================================================
-- Run this AFTER running portal_setup.sql to populate realistic test data.

DO $$
DECLARE
  v_client_id UUID;
  v_project_id UUID;
  v_admin_id UUID := '00000000-0000-0000-0000-000000000001';
  v_client_user_id UUID := '00000000-0000-0000-0000-000000000002';
  v_page_home_id UUID;
  v_page_about_id UUID;
  v_page_services_id UUID;
  v_feedback_1_id UUID;
BEGIN
  -- 1. Create Demo Client Profile
  INSERT INTO public.clients (id, business_name, contact_name, email, phone, website, status)
  VALUES (
    gen_random_uuid(),
    'Psycortex',
    'Alba Cortez',
    'alba@psycortex.com',
    '(555) 234-5678',
    'https://psycortex.com',
    'active'
  )
  RETURNING id INTO v_client_id;

  -- 2. Create Demo Project
  INSERT INTO public.projects (
    id,
    client_id,
    name,
    description,
    project_type,
    status,
    current_phase,
    progress_percentage,
    start_date,
    target_launch_date,
    preview_url,
    production_url
  )
  VALUES (
    gen_random_uuid(),
    v_client_id,
    'Psycortex Corporate Website',
    'State-of-the-art web design agency platform & interactive corporate website.',
    'Custom Website Design & Build',
    'Active',
    'Build',
    65,
    '2026-08-01',
    '2026-09-15',
    'https://dreambuiltstudios.com',
    'https://psycortex.com'
  )
  RETURNING id INTO v_project_id;

  -- 3. Create Project Phases
  INSERT INTO public.project_phases (project_id, name, order_index, status, completed_at) VALUES
  (v_project_id, 'Dream', 1, 'Completed', now() - INTERVAL '10 days'),
  (v_project_id, 'Design', 2, 'Completed', now() - INTERVAL '5 days'),
  (v_project_id, 'Build', 3, 'Current', NULL),
  (v_project_id, 'Review', 4, 'Upcoming', NULL),
  (v_project_id, 'Launch', 5, 'Upcoming', NULL);

  -- 4. Create Milestones
  INSERT INTO public.milestones (project_id, title, description, due_date, status, completed_at) VALUES
  (v_project_id, 'Brand Discovery & Sitemap', 'Initial intake & asset collection', '2026-08-05', 'Completed', now() - INTERVAL '8 days'),
  (v_project_id, 'Homepage Design Concept', 'Interactive mockup review', '2026-08-10', 'Completed', now() - INTERVAL '3 days'),
  (v_project_id, 'Homepage Review Build', 'Full responsive homepage build', '2026-08-18', 'Pending', NULL),
  (v_project_id, 'Final QA & SEO Launch', 'Domain setup, SEO optimization, and live launch', '2026-09-15', 'Pending', NULL);

  -- 5. Create Website Pages
  INSERT INTO public.website_pages (id, project_id, page_name, page_slug, status, preview_url, version, notes)
  VALUES (gen_random_uuid(), v_project_id, 'Home Page', '/', 'Ready for Review', 'https://dreambuiltstudios.com', '1.2', 'Initial build ready for feedback')
  RETURNING id INTO v_page_home_id;

  INSERT INTO public.website_pages (id, project_id, page_name, page_slug, status, preview_url, version, notes)
  VALUES (gen_random_uuid(), v_project_id, 'About Page', '/about', 'Building', 'https://dreambuiltstudios.com#about', '1.0', 'Layout in progress')
  RETURNING id INTO v_page_about_id;

  INSERT INTO public.website_pages (id, project_id, page_name, page_slug, status, preview_url, version, notes)
  VALUES (gen_random_uuid(), v_project_id, 'Services Page', '/services', 'Approved', 'https://dreambuiltstudios.com#services', '1.1', 'Approved by Alba')
  RETURNING id INTO v_page_services_id;

  INSERT INTO public.website_pages (project_id, page_name, page_slug, status, preview_url, version, notes)
  VALUES (v_project_id, 'Contact Page', '/contact', 'Planned', 'https://dreambuiltstudios.com#contact', '1.0', 'Scheduled for build phase 2');

  -- 6. Create Action Items (Needs Your Attention)
  INSERT INTO public.action_items (project_id, title, description, assigned_role, due_date, priority, status, action_type, target_entity_id) VALUES
  (v_project_id, 'Upload founder headshot', 'Please upload a high-res photo of Alba for the About page.', 'client', '2026-08-15', 'Important', 'Action Required', 'upload_file', NULL),
  (v_project_id, 'Review Homepage build', 'Inspect the live preview of the homepage and submit revision notes.', 'client', '2026-08-17', 'Normal', 'Action Required', 'review_page', v_page_home_id),
  (v_project_id, 'Approve Services Page', 'Formally approve the finalized Services page.', 'client', '2026-08-20', 'Normal', 'Action Required', 'approve_milestone', v_page_services_id);

  -- 7. Create Feedback Requests
  INSERT INTO public.feedback_requests (id, project_id, website_page_id, title, section_name, description, priority, status)
  VALUES (
    gen_random_uuid(),
    v_project_id,
    v_page_about_id,
    'Replace Founder Photo',
    'Founder Bio Section',
    'Can we update the founder photo to the new high-resolution studio shot?',
    'Normal',
    'In Progress'
  )
  RETURNING id INTO v_feedback_1_id;

  INSERT INTO public.feedback_requests (project_id, website_page_id, title, section_name, description, priority, status)
  VALUES (
    v_project_id,
    v_page_services_id,
    'Update Headline Copy',
    'Hero Section',
    'Tweak main headline text to emphasize rapid growth solutions.',
    'Important',
    'Ready for Review'
  );

  -- 8. Create Feedback Comments
  INSERT INTO public.comments (feedback_request_id, message) VALUES
  (v_feedback_1_id, 'CLIENT: Can we make sure the background matches our dark theme gradient?'),
  (v_feedback_1_id, 'DREAM BUILT: Absolutely! Once you upload the new headshot we will blend it seamlessly into the dark glassmorphic layout.');

  -- 9. Create Project Updates
  INSERT INTO public.project_updates (project_id, title, body) VALUES (
    v_project_id,
    'Homepage Build Complete',
    'We have completed the first responsive build of your homepage! Please review the latest build on the preview link and submit any requested changes through the feedback tab.'
  );

  -- 10. Create Project Links
  INSERT INTO public.project_links (project_id, label, url, category, client_visible) VALUES
  (v_project_id, 'Website Staging Preview', 'https://dreambuiltstudios.com', 'Preview', true),
  (v_project_id, 'Figma Design Canvas', 'https://figma.com', 'Design', true),
  (v_project_id, 'Shared Brand Assets Drive', 'https://drive.google.com', 'Assets', true);

  -- 11. Create Activity Log Entries
  INSERT INTO public.activity_log (project_id, action_type, description) VALUES
  (v_project_id, 'update_posted', 'Dream Built posted a project update: Homepage Build Complete.'),
  (v_project_id, 'page_status', 'Home Page moved to Ready for Review.'),
  (v_project_id, 'file_upload', 'Alba Cortez uploaded brand-logo-icon.svg.'),
  (v_project_id, 'feedback_submitted', 'Alba Cortez submitted feedback: Replace Founder Photo.');

END $$;
