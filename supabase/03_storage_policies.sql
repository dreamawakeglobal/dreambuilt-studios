-- 03: STORAGE BUCKET & FILE PERMISSIONS

INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-files', 'project-files', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Allow public file uploads" ON storage.objects;
CREATE POLICY "Allow public file uploads" 
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'project-files');

DROP POLICY IF EXISTS "Allow public file access" ON storage.objects;
CREATE POLICY "Allow public file access" 
ON storage.objects FOR SELECT USING (bucket_id = 'project-files');
