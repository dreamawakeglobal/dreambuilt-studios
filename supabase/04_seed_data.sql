-- 04: SEED DEMO DATA (Psycortex Workspace)

INSERT INTO public.clients (id, business_name, contact_name, email, phone, avatar_initials)
VALUES ('11111111-1111-1111-1111-111111111111', 'Psycortex', 'Alba Cortez', 'alba@psycortex.com', '(555) 234-5678', 'AC')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.projects (id, client_id, project_name, current_phase, progress_pct, target_launch_date, status)
VALUES ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Psycortex Corporate Website', 'Build', 52, 'Sept 15, 2026', 'Active')
ON CONFLICT (id) DO NOTHING;

-- Seed Psycortex Checklist Items
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
