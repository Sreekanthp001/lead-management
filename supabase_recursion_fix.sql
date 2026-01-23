-- FIX INFINITE RECURSION IN RLS
-- The previous policy likely checked 'profiles' table recursively.
-- This script replaces it with a simple JWT metadata check.

-- 1. Disable RLS momentarily to drop clean (optional but safe)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- 2. Drop potential recursive policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON profiles;

-- 3. Re-Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Create Policy: Users see themselves (No recursion, ID check is fast)
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id
);

-- 5. Create Policy: Admins see EVERYONE
-- CRITICAL FIX: Instead of SELECTing from profiles again, we check the JWT metadata.
-- This assumes 'role' is stored in user_metadata which is available in auth.jwt()
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
);

-- 6. Grant Modification Rights to Admins (also using JWT check)
CREATE POLICY "Admins can update profiles"
ON profiles FOR UPDATE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
);

CREATE POLICY "Admins can delete profiles"
ON profiles FOR DELETE
TO authenticated
USING (
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin' OR
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'super_admin'
);
