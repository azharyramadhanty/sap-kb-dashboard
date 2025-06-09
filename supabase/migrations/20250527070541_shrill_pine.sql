/*
  # Update document storage and policies
  
  1. Schema Changes
    - Add storage_path column to documents table
    - Remove content column if it exists
    
  2. Security Updates
    - Update document access policies
    - Configure storage policies for authenticated users
    - Ensure proper RLS for document sharing
*/

-- Add storage_path column
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS storage_path text;

-- Remove content column if it exists
DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'content'
  ) THEN
    ALTER TABLE documents DROP COLUMN content;
  END IF;
END $$;

-- Drop existing policies before recreating them
DROP POLICY IF EXISTS "Users can view documents they have access to" ON documents;
DROP POLICY IF EXISTS "Users can insert documents" ON documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
DROP POLICY IF EXISTS "Users can manage document access" ON document_access;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can download documents" ON storage.objects;

-- Update document policies
CREATE POLICY "Users can view documents they have access to"
  ON documents
  FOR SELECT
  TO authenticated
  USING (
    uploader_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM document_access
      WHERE document_access.document_id = id
      AND document_access.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = uploader_id
  );

CREATE POLICY "Users can update their own documents"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (
    auth.uid() = uploader_id
  );

-- Update document_access policy
CREATE POLICY "Users can manage document access"
  ON document_access
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_id
      AND documents.uploader_id = auth.uid()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM documents
      WHERE documents.id = document_id
      AND documents.uploader_id = auth.uid()
    )
  );

-- Configure storage policies
CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
  );

CREATE POLICY "Authenticated users can download documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents' AND
    EXISTS (
      SELECT 1 FROM documents
      WHERE storage_path = name AND (
        uploader_id = auth.uid() OR
        EXISTS (
          SELECT 1 FROM document_access
          WHERE document_access.document_id = documents.id
          AND document_access.user_id = auth.uid()
        )
      )
    )
  );