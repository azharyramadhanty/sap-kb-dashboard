/*
  # Fix RLS Infinite Recursion in Document Policies
  
  1. Changes
    - Create SECURITY DEFINER function to check document ownership without triggering RLS
    - Replace circular RLS policies with non-recursive ones
    - Fix document_access and activities table policies
  
  2. Security
    - Maintain proper access control without circular dependencies
    - Use security definer functions to bypass RLS where safe
*/

-- Create a security definer function to check if user is document uploader
-- This function bypasses RLS to prevent infinite recursion
CREATE OR REPLACE FUNCTION public.is_document_uploader(doc_id uuid, user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM documents
    WHERE id = doc_id AND uploader_id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a security definer function to check document access
-- This function bypasses RLS to prevent infinite recursion
CREATE OR REPLACE FUNCTION public.has_document_access(doc_id uuid, user_id uuid)
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM document_access
    WHERE document_id = doc_id AND user_id = user_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view documents they have access to" ON documents;
DROP POLICY IF EXISTS "Users can manage document access" ON document_access;

-- Create new non-recursive policy for documents SELECT
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

-- Fix activities table policy if it exists
DROP POLICY IF EXISTS "Users can view activities" ON activities;

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