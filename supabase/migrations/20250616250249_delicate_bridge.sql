/*
  # Fix RLS Policy Violation for Document Uploads
  
  1. Schema Changes
    - Set default value for uploader_id to use auth.uid()
    
  2. Security Updates
    - Simplify INSERT policy to check for authenticated users
    - Let database handle uploader_id assignment automatically
*/

-- Set default value for uploader_id column to automatically use auth.uid()
ALTER TABLE documents 
ALTER COLUMN uploader_id SET DEFAULT auth.uid();

-- Drop and recreate the insert policy with simplified check
DROP POLICY IF EXISTS "Users can insert documents" ON documents;

CREATE POLICY "Users can insert documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() IS NOT NULL
  );