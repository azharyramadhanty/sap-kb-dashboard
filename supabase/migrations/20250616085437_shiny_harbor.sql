/*
  # Fix RLS Policy Violation for Document Uploads
  
  1. Schema Changes
    - Set default value for uploader_id to use auth.uid()
    
  2. Security Updates
    - Fix INSERT policy to properly check uploader_id matches authenticated user
    - Ensure proper ownership validation on new records
*/

-- Set default value for uploader_id column to automatically use auth.uid()
ALTER TABLE documents 
ALTER COLUMN uploader_id SET DEFAULT auth.uid();

-- Drop and recreate the insert policy with proper ownership check
DROP POLICY IF EXISTS "Users can insert documents" ON documents;

CREATE POLICY "Users can insert documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = uploader_id
  );