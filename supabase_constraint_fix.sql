-- FIX PROFILES ROLE CONSTRAINT
-- This script resets the role check to allow 'agent', 'admin', and 'user'

-- 1. Drop the existing constraint (ignores error if it doesn't exist)
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;

-- 2. Add the clean constraint with lowercase values
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('admin', 'agent', 'user', 'super_admin', 'standard_agent'));

-- 3. Verification: Ensure all existing rows comply (set them to 'agent' if empty/wrong)
UPDATE profiles SET role = 'agent' WHERE role NOT IN ('admin', 'agent', 'user', 'super_admin', 'standard_agent') OR role IS NULL;

-- 4. Final Verification
SELECT id, email, role FROM profiles LIMIT 10;
