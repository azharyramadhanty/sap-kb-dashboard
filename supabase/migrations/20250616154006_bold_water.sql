/*
  # Fix Users Table Auth Reference
  
  1. Schema Changes
    - Remove default UUID generation from users.id
    - Add foreign key constraint to reference auth.users.id
    - This ensures users.id always matches auth.uid()
    
  2. Security Impact
    - Resolves RLS policy violation for document uploads
    - Ensures proper user identity matching between public.users and auth.users
*/

-- Remove the default UUID generation from users.id column
ALTER TABLE users 
ALTER COLUMN id DROP DEFAULT;

-- Add foreign key constraint to reference auth.users.id
-- This ensures users.id always matches the authenticated user's ID
ALTER TABLE users 
ADD CONSTRAINT users_id_fkey 
FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;