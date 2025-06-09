/*
  # Fix Document Upload Policies

  1. Changes
    - Update storage policies to properly handle document uploads
    - Ensure storage policies work with document table policies
    - Fix RLS policies for document creation flow
  
  2. Security
    - Maintain RLS enforcement
    - Allow authenticated users to upload documents
    - Ensure proper access control
*/

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view documents they have access to" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete their own documents" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload documents" ON storage.objects;
DROP POLICY IF EXISTS "Users can view documents" ON storage.objects;

-- Create new storage policies with proper permissions
CREATE POLICY "Allow document uploads"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents'
);

CREATE POLICY "Allow document access"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM documents
    LEFT JOIN document_access ON documents.id = document_access.document_id
    WHERE 
      documents.storage_path = name AND
      (documents.uploader_id = auth.uid() OR document_access.user_id = auth.uid())
  )
);

CREATE POLICY "Allow document deletion"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  EXISTS (
    SELECT 1 FROM documents
    WHERE storage_path = name AND uploader_id = auth.uid()
  )
);

-- Drop and recreate document table policies to ensure proper access
DROP POLICY IF EXISTS "Users can insert documents" ON documents;
DROP POLICY IF EXISTS "Users can view documents they have access to" ON documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON documents;

CREATE POLICY "Users can insert documents"
ON documents
FOR INSERT
TO authenticated
WITH CHECK (
  auth.uid() = uploader_id
);

CREATE POLICY "Users can view documents they have access to"
ON documents
FOR SELECT
TO authenticated
USING (
  uploader_id = auth.uid() OR
  EXISTS (
    SELECT 1 FROM document_access
    WHERE document_id = documents.id AND user_id = auth.uid()
  )
);

CREATE POLICY "Users can update their own documents"
ON documents
FOR UPDATE
TO authenticated
USING (
  uploader_id = auth.uid()
);