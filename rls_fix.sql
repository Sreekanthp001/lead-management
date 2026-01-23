-- RLS Policy: Allow Admins to View All Profiles (avoiding recursion)

-- 1. Create a Helper Function (Security Definer)
-- This function runs with the privileges of the creator (postgres/superuser), bypassing RLS.
-- This allows us to check the user's role without triggering an infinite RLS loop on the profiles table.

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() 
    AND role IN ('admin', 'super_admin')
  );
$$;

-- 2. Enable RLS (if not already enabled)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. Drop existing conflicting policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- 4. Create the new Policy
-- "Users can see their own profile" is covered by "OR auth.uid() = id"
-- "Admins can see everyone" is covered by "is_admin()"

CREATE POLICY "View Profiles Policy"
ON public.profiles
FOR SELECT
TO authenticated
USING (
  auth.uid() = id 
  OR 
  is_admin()
);

-- Note: Ensure the is_admin() function is accessible
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;
