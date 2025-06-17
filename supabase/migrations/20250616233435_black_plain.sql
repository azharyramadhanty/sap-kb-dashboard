/*
  # Fix Ambiguous Column Reference in RLS Functions
  
  1. Changes
    - Rename function parameters to avoid conflicts with column names
    - Update is_document_uploader function parameter from user_id to p_user_id
    - Update has_document_access function parameter from user_id to p_user_id
  
  2. Security
    - Maintain existing security policies without changing functionality
    - Fix ambiguous column reference errors
*/

-- Drop and recreate the security definer function with non-ambiguous parameter names
DROP FUNCTION IF EXISTS public.is_document_uploader(uuid, uuid) CASCADE;

CREATE OR REPLACE FUNCTION public.is_document_uploader(doc_id uuid, p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM documents
    WHERE id = doc_id AND uploader_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop and recreate the security definer function with non-ambiguous parameter names
DROP FUNCTION IF EXISTS public.has_document_access(uuid, uuid) CASCADE;

CREATE OR REPLACE FUNCTION public.has_document_access(doc_id uuid, p_user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM document_access
    WHERE document_id = doc_id AND user_id = p_user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing policies to recreate them with updated function calls
DROP POLICY IF EXISTS "Users can view documents they have access to" ON documents;
DROP POLICY IF EXISTS "Users can view document access" ON document_access;
DROP POLICY IF EXISTS "Users can insert document access" ON document_access;
DROP POLICY IF EXISTS "Users can update document access" ON document_access;
DROP POLICY IF EXISTS "Users can delete document access" ON document_access;
DROP POLICY IF EXISTS "Users can view activities" ON activities;

-- Recreate policies with updated function calls
CREATE POLICY "Users can view documents they have access to"
  ON documents
  FOR SELECT
  TO authenticated
  USING (
    -- User can view if they uploaded it
    uploader_id = auth.uid() OR
    -- Or if they have explicit access (using security definer function)
    public.has_document_access(id, auth.uid())
  );

-- Create separate policies for document_access to avoid recursion
CREATE POLICY "Users can view document access"
  ON document_access
  FOR SELECT
  TO authenticated
  USING (
    -- User can view access records for documents they uploaded
    public.is_document_uploader(document_id, auth.uid()) OR
    -- Or access records that involve them
    user_id = auth.uid()
  );

CREATE POLICY "Users can insert document access"
  ON document_access
  FOR INSERT
  TO authenticated
  WITH CHECK (
    -- Only document uploaders can grant access
    public.is_document_uploader(document_id, auth.uid())
  );

CREATE POLICY "Users can update document access"
  ON document_access
  FOR UPDATE
  TO authenticated
  USING (
    -- Only document uploaders can modify access
    public.is_document_uploader(document_id, auth.uid())
  );

CREATE POLICY "Users can delete document access"
  ON document_access
  FOR DELETE
  TO authenticated
  USING (
    -- Only document uploaders can remove access
    public.is_document_uploader(document_id, auth.uid())
  );

-- Fix activities table policy
CREATE POLICY "Users can view activities"
  ON activities
  FOR SELECT
  TO authenticated
  USING (
    -- User can view activities for documents they uploaded
    public.is_document_uploader(document_id, auth.uid()) OR
    -- Or activities for documents they have access to
    public.has_document_access(document_id, auth.uid())
  );