
-- Fix 1: cast_vote - use auth.uid() instead of trusting p_user_id
CREATE OR REPLACE FUNCTION public.cast_vote(p_flint_id uuid, p_user_id uuid, p_vote_type text)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  existing_vote TEXT;
  actual_user_id UUID;
BEGIN
  -- Enforce caller identity
  actual_user_id := auth.uid();
  IF actual_user_id IS NULL OR actual_user_id != p_user_id THEN
    RAISE EXCEPTION 'Unauthorized';
  END IF;

  SELECT vote_type INTO existing_vote
  FROM public.votes
  WHERE flint_id = p_flint_id AND user_id = actual_user_id;

  IF existing_vote IS NOT NULL THEN
    IF existing_vote = p_vote_type THEN
      DELETE FROM public.votes WHERE flint_id = p_flint_id AND user_id = actual_user_id;
      IF p_vote_type = 'agree' THEN
        UPDATE public.flints SET agree_count = GREATEST(agree_count - 1, 0) WHERE id = p_flint_id;
      ELSE
        UPDATE public.flints SET disagree_count = GREATEST(disagree_count - 1, 0) WHERE id = p_flint_id;
      END IF;
    ELSE
      UPDATE public.votes SET vote_type = p_vote_type WHERE flint_id = p_flint_id AND user_id = actual_user_id;
      IF p_vote_type = 'agree' THEN
        UPDATE public.flints SET agree_count = agree_count + 1, disagree_count = GREATEST(disagree_count - 1, 0) WHERE id = p_flint_id;
        PERFORM public.increment_points(
          (SELECT author_id FROM public.flints WHERE id = p_flint_id), 1
        );
      ELSE
        UPDATE public.flints SET disagree_count = disagree_count + 1, agree_count = GREATEST(agree_count - 1, 0) WHERE id = p_flint_id;
      END IF;
    END IF;
  ELSE
    INSERT INTO public.votes (flint_id, user_id, vote_type) VALUES (p_flint_id, actual_user_id, p_vote_type);
    IF p_vote_type = 'agree' THEN
      UPDATE public.flints SET agree_count = agree_count + 1 WHERE id = p_flint_id;
      PERFORM public.increment_points(
        (SELECT author_id FROM public.flints WHERE id = p_flint_id), 1
      );
    ELSE
      UPDATE public.flints SET disagree_count = disagree_count + 1 WHERE id = p_flint_id;
    END IF;
  END IF;
END;
$function$;

-- Fix 2: Messages INSERT policy - require chat membership
DROP POLICY IF EXISTS "Users can send messages" ON public.messages;

CREATE POLICY "Participants can send messages" ON public.messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.chats
      WHERE chats.id = messages.chat_id
        AND (chats.user_a = auth.uid() OR chats.user_b = auth.uid())
    )
  );
