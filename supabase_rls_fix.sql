-- Enable RLS on profiles if not already enabled
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 1. Create Policy for Admins to view ALL profiles
-- This allows any user with role 'admin' or 'super_admin' to SELECT all rows in 'profiles'
CREATE POLICY "Admins can view all profiles"
ON profiles FOR SELECT
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
);

-- 2. Create Policy for Users to view their OWN profile
-- This is essential for non-admins to work, though 'Manage Team' might not be accessible to them.
-- They still need to read their own profile to know their role.
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
TO authenticated
USING (
  auth.uid() = id
);

-- 3. (Optional) Policy for Insert/Update/Delete - usually restricted to Admins or Self
-- For Manage Team, Admins strictly need DELETE/UPDATE on others.
CREATE POLICY "Admins can update all profiles"
ON profiles FOR UPDATE
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
);

CREATE POLICY "Admins can delete profiles"
ON profiles FOR DELETE
TO authenticated
USING (
  (SELECT role FROM profiles WHERE id = auth.uid()) IN ('admin', 'super_admin')
);
