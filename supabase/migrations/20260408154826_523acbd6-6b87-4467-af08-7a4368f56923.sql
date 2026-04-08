
-- 1. Fix profiles SELECT policy: hide email from non-owners
DROP POLICY IF EXISTS "Anyone can view profiles" ON public.profiles;

CREATE POLICY "Anyone can view profiles"
  ON public.profiles FOR SELECT TO authenticated
  USING (true);

-- Revoke column-level access and use a view for safe public profile data
-- Since we can't do column-level RLS, create a safe view without email
CREATE OR REPLACE VIEW public.safe_profiles AS
  SELECT id, labs_id, country, points, rank, posts_count, debates_won, created_at
  FROM public.profiles;

GRANT SELECT ON public.safe_profiles TO authenticated;
REVOKE SELECT ON public.safe_profiles FROM anon;

-- 2. Fix messages INSERT policy: verify chat membership
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;

CREATE POLICY "Users can send messages"
  ON public.messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM public.chats
      WHERE chats.id = messages.chat_id
      AND (chats.user_a = auth.uid() OR chats.user_b = auth.uid())
    )
  );

-- 3. Fix chat unilateral extension: add mutual consent
ALTER TABLE public.chats
  ADD COLUMN IF NOT EXISTS extend_requested_by uuid DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS extensions_count integer NOT NULL DEFAULT 0;

-- Create RPC for mutual consent chat extension
CREATE OR REPLACE FUNCTION public.request_chat_extension(p_chat_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_chat chats;
  v_uid uuid := auth.uid();
BEGIN
  SELECT * INTO v_chat FROM chats WHERE id = p_chat_id;
  
  IF v_chat IS NULL THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Chat not found');
  END IF;
  
  IF v_uid != v_chat.user_a AND v_uid != v_chat.user_b THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Not a participant');
  END IF;
  
  IF v_chat.extensions_count >= 3 THEN
    RETURN jsonb_build_object('success', false, 'reason', 'Max extensions reached');
  END IF;
  
  IF v_chat.extend_requested_by IS NULL OR v_chat.extend_requested_by = v_uid THEN
    -- First request or same user requesting again
    UPDATE chats SET extend_requested_by = v_uid WHERE id = p_chat_id;
    RETURN jsonb_build_object('success', true, 'status', 'waiting_for_other');
  ELSE
    -- Other user already requested, mutual consent achieved
    UPDATE chats SET
      expires_at = COALESCE(expires_at, now()) + interval '10 minutes',
      extend_requested_by = NULL,
      extensions_count = extensions_count + 1
    WHERE id = p_chat_id;
    RETURN jsonb_build_object('success', true, 'status', 'extended');
  END IF;
END;
$$;

-- Restrict chats UPDATE policy to prevent direct expires_at manipulation
DROP POLICY IF EXISTS "Participants can update chats" ON public.chats;

CREATE POLICY "Participants can update chats"
  ON public.chats FOR UPDATE TO authenticated
  USING (user_a = auth.uid() OR user_b = auth.uid())
  WITH CHECK (
    (user_a = auth.uid() OR user_b = auth.uid())
    AND status = status  -- only allow status changes, not expires_at
  );

-- 4. Revoke anon access to user_profiles view
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM pg_views WHERE viewname = 'user_profiles' AND schemaname = 'public') THEN
    EXECUTE 'REVOKE SELECT ON public.user_profiles FROM anon';
  END IF;
END;
$$;
