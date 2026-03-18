
-- 1. Drop old find_chat_match(uuid, text) and replace with find_chat_match(text) using auth.uid()
DROP FUNCTION IF EXISTS public.find_chat_match(uuid, text);

CREATE OR REPLACE FUNCTION public.find_chat_match(p_topic text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  caller_id UUID := auth.uid();
  matched_user UUID;
  new_chat_id UUID;
BEGIN
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT user_id INTO matched_user
  FROM public.chat_queue
  WHERE user_id != caller_id
  ORDER BY created_at ASC
  LIMIT 1
  FOR UPDATE SKIP LOCKED;

  IF matched_user IS NULL THEN
    INSERT INTO public.chat_queue (user_id, topic)
    VALUES (caller_id, p_topic)
    ON CONFLICT (user_id) DO UPDATE SET topic = p_topic, created_at = now();
    RETURN NULL;
  END IF;

  DELETE FROM public.chat_queue WHERE user_id = matched_user;
  DELETE FROM public.chat_queue WHERE user_id = caller_id;

  INSERT INTO public.chats (user_a, user_b, topic, expires_at)
  VALUES (caller_id, matched_user, p_topic, now() + INTERVAL '10 minutes')
  RETURNING id INTO new_chat_id;

  RETURN new_chat_id;
END;
$$;

-- 2. Create accept_debate RPC for secure state transitions
CREATE OR REPLACE FUNCTION public.accept_debate(p_debate_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_status text;
  v_user_b uuid;
  caller_id uuid := auth.uid();
BEGIN
  IF caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT status, user_b INTO v_status, v_user_b
  FROM public.debates
  WHERE id = p_debate_id;

  IF v_user_b IS NULL THEN
    RAISE EXCEPTION 'Debate not found';
  END IF;

  IF v_user_b != caller_id THEN
    RAISE EXCEPTION 'Only the challenged user can accept';
  END IF;

  IF v_status != 'pending' THEN
    RAISE EXCEPTION 'Debate is not pending';
  END IF;

  UPDATE public.debates
  SET status = 'active', ends_at = now() + INTERVAL '3 minutes'
  WHERE id = p_debate_id;
END;
$$;

-- 3. Remove overly permissive debates UPDATE policy
DROP POLICY IF EXISTS "Participants can update debates" ON public.debates;

-- 4. Restrict users table SELECT to owner-only (protect email)
DROP POLICY IF EXISTS "Authenticated can read all profiles" ON public.users;
CREATE POLICY "Users can read own data" ON public.users
  FOR SELECT TO authenticated
  USING (auth.uid() = id);

-- 5. Recreate user_profiles view as non-security-invoker (runs as owner, bypasses RLS)
-- This allows reading public profile data (excluding email) for all users
DROP VIEW IF EXISTS public.user_profiles;
CREATE VIEW public.user_profiles
WITH (security_invoker = false)
AS SELECT id, labs_id, points, rank, country, created_at, interests
FROM public.users;

GRANT SELECT ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;
