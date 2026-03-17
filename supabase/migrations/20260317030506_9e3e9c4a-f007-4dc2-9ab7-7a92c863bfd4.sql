
-- Fix 1: Revoke public access to increment_points to prevent arbitrary points manipulation
REVOKE EXECUTE ON FUNCTION public.increment_points(uuid, integer) FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.increment_points(uuid, integer) FROM authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_points(uuid, integer) FROM anon;

-- Fix 2: Drop the overly permissive notifications INSERT policy
-- Notifications should only be inserted via SECURITY DEFINER triggers
DROP POLICY IF EXISTS "Users can insert own notifications" ON public.notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON public.notifications;
