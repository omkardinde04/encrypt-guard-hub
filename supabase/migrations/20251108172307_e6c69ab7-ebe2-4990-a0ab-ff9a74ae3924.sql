-- Create private storage bucket for encrypted files
INSERT INTO storage.buckets (id, name, public)
VALUES ('vault', 'vault', false)
ON CONFLICT (id) DO NOTHING;

-- Policies for storage.objects for 'vault' bucket
-- Allow users to view their own files
CREATE POLICY "Users can view their own objects in vault"
ON storage.objects
FOR SELECT
USING (
  bucket_id = 'vault'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to upload to their own folder
CREATE POLICY "Users can upload their own objects in vault"
ON storage.objects
FOR INSERT
WITH CHECK (
  bucket_id = 'vault'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to update their own files
CREATE POLICY "Users can update their own objects in vault"
ON storage.objects
FOR UPDATE
USING (
  bucket_id = 'vault'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow users to delete their own files
CREATE POLICY "Users can delete their own objects in vault"
ON storage.objects
FOR DELETE
USING (
  bucket_id = 'vault'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
