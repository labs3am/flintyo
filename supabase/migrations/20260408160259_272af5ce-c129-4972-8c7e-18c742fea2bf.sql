-- Fix safe_profiles view to use SECURITY INVOKER instead of default SECURITY DEFINER
CREATE OR REPLACE VIEW public.safe_profiles
WITH (security_invoker = true)
AS
  SELECT id, labs_id, country, points, rank, posts_count, debates_won, created_at
  FROM public.profiles;

GRANT SELECT ON public.safe_profiles TO authenticated;
REVOKE SELECT ON public.safe_profiles FROM anon;