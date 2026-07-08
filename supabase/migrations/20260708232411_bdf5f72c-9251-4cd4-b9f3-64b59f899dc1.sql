
-- RLS policies for biblioteca-visual (private bucket)
CREATE POLICY "Authenticated users can view biblioteca-visual"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'biblioteca-visual');

CREATE POLICY "Authenticated users can upload to biblioteca-visual"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'biblioteca-visual');

CREATE POLICY "Authenticated users can update biblioteca-visual"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'biblioteca-visual');

CREATE POLICY "Authenticated users can delete from biblioteca-visual"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'biblioteca-visual');
