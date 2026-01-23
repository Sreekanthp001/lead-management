-- FINAL CONSOLIDATED RLS FIX
-- This script handles both 'profiles' and 'leads' tables to ensure full access for Admin and User roles.

-- ==========================================
-- 1. PROFILES TABLE CLEANUP & POLICIES
-- ==========================================

-- Disable RLS to ensure clean state
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop existing policies to prevent conflicts
DROP POLICY IF EXISTS "Enable read for authenticated users" ON profiles;
DROP POLICY IF EXISTS "Enable insert for admins" ON profiles;
DROP POLICY IF EXISTS "Enable update for users on own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;
DROP POLICY IF EXISTS "Enable read for all" ON profiles;

-- Re-enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Enable SELECT for all authenticated users
-- This prevents recursion by using a simple TRUE check
DROP POLICY IF EXISTS "Enable read for authenticated users" ON profiles;
CREATE POLICY "Enable read for authenticated users" 
ON profiles FOR SELECT 
TO authenticated 
USING (true);

-- Policy: Enable INSERT for authenticated users
-- Essential for registration and team management
DROP POLICY IF EXISTS "Enable insert for all authenticated" ON profiles;
CREATE POLICY "Enable insert for all authenticated" 
ON profiles FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Policy: Enable UPDATE for users on own profile
-- FIXED: Added both USING and WITH CHECK to ensure full update capability
DROP POLICY IF EXISTS "Enable update for users on own profile" ON profiles;
CREATE POLICY "Enable update for users on own profile" 
ON profiles FOR UPDATE 
TO authenticated 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- ==========================================
-- 2. LEADS TABLE CLEANUP & POLICIES
-- ==========================================

-- Disable RLS for cleanup
ALTER TABLE leads DISABLE ROW LEVEL SECURITY;

-- Drop any existing lead policies
DROP POLICY IF EXISTS "Leads are viewable by assigned user" ON leads;
DROP POLICY IF EXISTS "Leads are viewable by owner" ON leads;
DROP POLICY IF EXISTS "Admins can view all leads" ON leads;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON leads;
DROP POLICY IF EXISTS "Enable read for all authenticated users" ON leads;
DROP POLICY IF EXISTS "Enable update for owners and admins" ON leads;
DROP POLICY IF EXISTS "Enable delete for admins" ON leads;

-- Re-enable RLS
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Policy: Enable SELECT for both ADMIN and USER
-- Allows all authenticated users to see leads (filtering is handled at application level)
DROP POLICY IF EXISTS "leads_select_policy" ON leads;
CREATE POLICY "leads_select_policy"
ON leads FOR SELECT
TO authenticated
USING (true);

-- Policy: Enable INSERT for both ADMIN and USER
-- Ensures the "Add Lead" button works for everyone
DROP POLICY IF EXISTS "leads_insert_policy" ON leads;
CREATE POLICY "leads_insert_policy"
ON leads FOR INSERT
TO authenticated
WITH CHECK (true);

-- Policy: Enable UPDATE for both ADMIN and USER
-- Allows users to update lead status, notes, etc.
DROP POLICY IF EXISTS "leads_update_policy" ON leads;
CREATE POLICY "leads_update_policy"
ON leads FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

-- Policy: Enable DELETE (Reserved for safety, or enable if needed)
DROP POLICY IF EXISTS "leads_delete_policy" ON leads;
CREATE POLICY "leads_delete_policy"
ON leads FOR DELETE
TO authenticated
USING (true);

-- ==========================================
-- VERIFICATION
-- ==========================================
-- 1. Profiles should now load instantly without recursion.
-- 2. "Add Lead" button will no longer fail due to RLS.
-- 3. Lead Detail screen will display intel for all 'USER' and 'ADMIN' roles.
