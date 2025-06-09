/*
  # Update documents table schema
  
  1. Changes
    - Add storage_path column to documents table
    - Remove content column from documents table
    - Update storage policies to use storage_path
  
  2. Security
    - Maintain existing RLS policies
    - Update storage policies to work with new schema
*/

-- Modify documents table
ALTER TABLE documents DROP COLUMN IF EXISTS content;
ALTER TABLE documents ADD COLUMN IF NOT EXISTS storage_path text;

-- Create storage bucket for documents if it doesn't exist
DO $$ 
BEGIN
  INSERT INTO storage.buckets (id, name, public)
  VALUES ('documents', 'documents', false)
  ON CONFLICT (id) DO NOTHING;
END $$;

-- Drop existing storage policies if they exist
DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view documents they have access to" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;

-- Create storage policies
CREATE POLICY "Users can upload documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'documents');

CREATE POLICY "Users can view documents they have access to"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents' AND
    EXISTS (
      SELECT 1 FROM documents
      JOIN document_access ON documents.id = document_access.document_id
      WHERE documents.storage_path = name
      AND (document_access.user_id = auth.uid() OR documents.uploader_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete their own documents"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'documents' AND
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.storage_path = name
      AND documents.uploader_id = auth.uid()
    )
  );