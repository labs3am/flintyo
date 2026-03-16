
-- Chat queue for matching users in Let's Talk
CREATE TABLE public.chat_queue (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE UNIQUE,
  topic TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.chat_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read queue" ON public.chat_queue
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can join queue" ON public.chat_queue
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave queue" ON public.chat_queue
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Enable realtime on chats and messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.chats;
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;

-- Function to find match and create chat
CREATE OR REPLACE FUNCTION public.find_chat_match(p_user_id UUID, p_topic TEXT)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  matched_user UUID;
  new_chat_id UUID;
BEGIN
  -- Find first available user in queue (not self)
  SELECT user_id INTO matched_user
  FROM public.chat_queue
  WHERE user_id != p_user_id
  ORDER BY created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF matched_user IS NULL THEN
    -- No match, add to queue
    INSERT INTO public.chat_queue (user_id, topic)
    VALUES (p_user_id, p_topic)
    ON CONFLICT (user_id) DO UPDATE SET topic = p_topic, created_at = now();
    RETURN NULL;
  END IF;

  -- Remove matched user from queue
  DELETE FROM public.chat_queue WHERE user_id = matched_user;
  -- Remove self from queue if present
  DELETE FROM public.chat_queue WHERE user_id = p_user_id;

  -- Create chat
  INSERT INTO public.chats (user_a, user_b, topic, expires_at)
  VALUES (p_user_id, matched_user, p_topic, now() + INTERVAL '10 minutes')
  RETURNING id INTO new_chat_id;

  RETURN new_chat_id;
END;
$$;
