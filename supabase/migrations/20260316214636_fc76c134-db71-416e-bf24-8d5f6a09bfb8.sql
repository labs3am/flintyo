
-- Fix the overly permissive insert policy
DROP POLICY "System can insert notifications" ON public.notifications;

-- Only allow inserting notifications for yourself (triggers bypass RLS via SECURITY DEFINER)
CREATE POLICY "Users can insert own notifications" ON public.notifications
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);
