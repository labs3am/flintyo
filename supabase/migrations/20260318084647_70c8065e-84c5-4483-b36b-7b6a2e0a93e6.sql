-- Allow all authenticated users to read public profile data
-- The user_profiles view already excludes email, so reading users table is acceptable
-- Drop the old restrictive policy first
DROP POLICY IF EXISTS "Users can read own profile" ON public.users;

-- Create a broader policy allowing all authenticated users to read profiles
CREATE POLICY "Authenticated can read all profiles"
  ON public.users
  FOR SELECT
  TO authenticated
  USING (true);
