-- Fix: Restrict chat_queue SELECT to own entries only (privacy protection)
DROP POLICY IF EXISTS "Users can read queue" ON public.chat_queue;
CREATE POLICY "Users can read own queue entry"
  ON public.chat_queue
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);