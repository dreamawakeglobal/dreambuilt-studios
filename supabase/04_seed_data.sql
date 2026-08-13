-- 04: SEED DEMO DATA (Psycortex Workspace)

INSERT INTO public.clients (id, business_name, contact_name, email, phone, avatar_initials)
VALUES ('11111111-1111-1111-1111-111111111111', 'Psycortex', 'Alba Cortez', 'alba@psycortex.com', '(555) 234-5678', 'AC')
ON CONFLICT (email) DO NOTHING;

INSERT INTO public.projects (id, client_id, project_name, current_phase, progress_pct, target_launch_date, status)
VALUES ('22222222-2222-2222-2222-222222222222', '11111111-1111-1111-1111-111111111111', 'Psycortex Corporate Website', 'Build', 69, 'Sept 15, 2026', 'Active')
ON CONFLICT (id) DO NOTHING;
