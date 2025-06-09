/*
  # Fix document storage and access policies
  
  1. Changes
    - Add storage_path column to documents table
    - Remove content column if it exists
    - Update RLS policies for documents and document_access
    - Configure storage bucket and policies
  
  2. Security
    - Enable RLS for all tables
    - Add policies for document access control
    - Add storage bucket policies for authenticated users
*/

-- Transaction 1: Handle document table modifications
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'storage_path'
  ) THEN
    ALTER TABLE documents ADD COLUMN storage_path text;
  END IF;
END $$;

DO $$ 
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'documents' AND column_name = 'content'
  ) THEN
    ALTER TABLE documents DROP COLUMN content;
  END IF;
END $$;

-- Transaction 2: Update document policies
DROP POLICY IF EXISTS "Users can view documents they have access to" ON documents;
DROP POLICY IF EXISTS "Users can insert documents" ON documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON documents;

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

-- Transaction 3: Update document_access policies
DROP POLICY IF EXISTS "Users can manage access to their documents" ON document_access;

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

-- Transaction 4: Configure storage
INSERT INTO storage.buckets (id, name)
VALUES ('documents', 'documents')
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents'
  );

DROP POLICY IF EXISTS "Authenticated users can download documents" ON storage.objects;
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