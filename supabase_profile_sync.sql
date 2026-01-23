-- AUTOMATIC PROFILE SYNC TRIGGER
-- This script ensures that every time a new user is created in auth.users, 
-- a corresponding entry is created in the public.profiles table with 'agent' as the default role.

-- 1. Create the trigger function
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, name, role)
  VALUES (
    new.id, 
    new.email, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.email), 
    COALESCE(new.raw_user_meta_data->>'full_name', new.email),
    COALESCE(new.raw_user_meta_data->>'role', 'agent')
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = EXCLUDED.full_name,
    name = EXCLUDED.name;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Drop the trigger if it exists to avoid duplication
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 3. Create the trigger on auth.users
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Sync existing users who might be missing a profile
INSERT INTO public.profiles (id, email, full_name, name, role)
SELECT 
  id, 
  email, 
  COALESCE(raw_user_meta_data->>'full_name', email),
  COALESCE(raw_user_meta_data->>'full_name', email),
  COALESCE(raw_user_meta_data->>'role', 'agent')
FROM auth.users
ON CONFLICT (id) DO NOTHING;
