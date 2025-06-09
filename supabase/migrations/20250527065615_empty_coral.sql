/*
  # Document Management System Schema

  1. New Tables
    - documents: Stores document metadata
    - document_access: Manages document sharing permissions
    - activities: Tracks user interactions with documents

  2. Security
    - Enable RLS on all tables
    - Add policies for document access control
    - Add policies for activity tracking
*/

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view documents they have access to" ON documents;
DROP POLICY IF EXISTS "Users can insert documents" ON documents;
DROP POLICY IF EXISTS "Users can update their own documents" ON documents;
DROP POLICY IF EXISTS "Users can view document access" ON document_access;
DROP POLICY IF EXISTS "Users can manage access to their documents" ON document_access;
DROP POLICY IF EXISTS "Users can view activities for their documents" ON activities;
DROP POLICY IF EXISTS "Users can insert activities" ON activities;

-- Create tables if they don't exist
CREATE TABLE IF NOT EXISTS documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type text NOT NULL,
  size bigint NOT NULL,
  file_path text NOT NULL,
  uploader_id uuid NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  archived_at timestamptz,
  FOREIGN KEY (uploader_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS document_access (
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  PRIMARY KEY (document_id, user_id)
);

CREATE TABLE IF NOT EXISTS activities (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  type text NOT NULL,
  document_id uuid REFERENCES documents(id) ON DELETE CASCADE,
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE activities ENABLE ROW LEVEL SECURITY;

-- Create policies for documents table
CREATE POLICY "Users can view documents they have access to"
  ON documents
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM document_access
      WHERE document_id = documents.id
      AND user_id = auth.uid()
    ) OR uploader_id = auth.uid()
  );

CREATE POLICY "Users can insert documents"
  ON documents
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = uploader_id);

CREATE POLICY "Users can update their own documents"
  ON documents
  FOR UPDATE
  TO authenticated
  USING (uploader_id = auth.uid());

-- Create policies for document_access table
CREATE POLICY "Users can view document access"
  ON document_access
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE id = document_id
      AND uploader_id = auth.uid()
    ) OR user_id = auth.uid()
  );

CREATE POLICY "Users can manage access to their documents"
  ON document_access
  FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE id = document_id
      AND uploader_id = auth.uid()
    )
  );

-- Create policies for activities table
CREATE POLICY "Users can view activities for their documents"
  ON activities
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM documents
      WHERE id = document_id
      AND uploader_id = auth.uid()
    ) OR user_id = auth.uid()
  );

CREATE POLICY "Users can insert activities"
  ON activities
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);