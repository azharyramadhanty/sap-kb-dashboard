/*
  # Fix Document Upload RLS Policies

  1. Changes
    - Update RLS policies for documents table to allow authenticated users to upload documents
    - Add storage bucket policies for document uploads
    - Ensure proper user validation for document creation

  2. Security
    - Maintains RLS enforcement
    - Ensures users can only upload their own documents
    - Validates user authentication for all operations
*/

-- Drop existing policies to recreate them with correct permissions
DROP POLICY IF EXISTS "Users can insert documents" ON documents;

-- Create new insert policy that properly validates the uploader
CREATE POLICY "Users can insert documents"
ON documents
FOR INSERT
TO authenticated
WITH CHECK (
  -- Ensure the uploader_id matches the authenticated user's ID
  auth.uid() = uploader_id
);

-- Ensure storage policies are correctly set
DO $$
BEGIN
  -- Create storage bucket if it doesn't exist
  INSERT INTO storage.buckets (id, name)
  VALUES ('documents', 'documents')
  ON CONFLICT (id) DO NOTHING;

  -- Set up storage policies
  DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
  DROP POLICY IF EXISTS "Users can view documents" ON storage.objects;

  CREATE POLICY "Authenticated users can upload documents"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'documents' AND
    auth.role() = 'authenticated'
  );

  CREATE POLICY "Users can view documents"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'documents' AND
    (
      -- User can view if they uploaded it
      (SELECT uploader_id FROM documents WHERE storage_path = (storage.objects.name)) = auth.uid()
      OR
      -- Or if they have access through document_access
      EXISTS (
        SELECT 1 FROM document_access
        WHERE document_id = (SELECT id FROM documents WHERE storage_path = (storage.objects.name))
        AND user_id = auth.uid()
      )
    )
  );
END $$;