-- Run this SQL in your Supabase Dashboard SQL Editor
-- URL: https://supabase.com/dashboard/project/pyzdlndpapdztdbvmnkt/sql/editor

-- Step 1: Add quotation_url column to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS quotation_url text;

-- Step 2: Create storage bucket for document uploads
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-documents', 'project-documents', true) 
ON CONFLICT (id) DO NOTHING;

-- Step 3: Set storage policies for the bucket
CREATE POLICY "Allow public uploads" ON storage.objects 
FOR INSERT WITH CHECK (bucket_id = 'project-documents');

CREATE POLICY "Allow public reads" ON storage.objects 
FOR SELECT USING (bucket_id = 'project-documents');