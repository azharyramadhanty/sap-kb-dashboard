/*
  # Add category column to documents table

  1. Schema Changes
    - Add category column to documents table with default value
    - Set up proper constraints for category values

  2. Data Migration
    - Update existing documents with default category based on name
*/

-- Add category column to documents table
ALTER TABLE documents 
ADD COLUMN IF NOT EXISTS category text DEFAULT 'SAP CMCT';

-- Add check constraint to ensure only valid categories are used
ALTER TABLE documents 
ADD CONSTRAINT documents_category_check 
CHECK (category IN ('SAP CMCT', 'SAP FI', 'SAP QM'));

-- Update existing documents to have proper categories based on their names
UPDATE documents 
SET category = CASE 
  WHEN LOWER(name) LIKE '%cmct%' THEN 'SAP CMCT'
  WHEN LOWER(name) LIKE '%fi%' THEN 'SAP FI'
  WHEN LOWER(name) LIKE '%qm%' THEN 'SAP QM'
  ELSE 'SAP CMCT'
END
WHERE category IS NULL OR category = 'SAP CMCT';