
-- Votes table to prevent double voting
CREATE TABLE public.votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flint_id UUID NOT NULL REFERENCES public.flints(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('agree', 'disagree')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (flint_id, user_id)
);

ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read votes" ON public.votes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can insert own votes" ON public.votes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own votes" ON public.votes
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- Function to cast a vote atomically
CREATE OR REPLACE FUNCTION public.cast_vote(
  p_flint_id UUID,
  p_user_id UUID,
  p_vote_type TEXT
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_vote TEXT;
BEGIN
  -- Check for existing vote
  SELECT vote_type INTO existing_vote
  FROM public.votes
  WHERE flint_id = p_flint_id AND user_id = p_user_id;

  IF existing_vote IS NOT NULL THEN
    -- Same vote = remove it
    IF existing_vote = p_vote_type THEN
      DELETE FROM public.votes WHERE flint_id = p_flint_id AND user_id = p_user_id;
      IF p_vote_type = 'agree' THEN
        UPDATE public.flints SET agree_count = GREATEST(agree_count - 1, 0) WHERE id = p_flint_id;
      ELSE
        UPDATE public.flints SET disagree_count = GREATEST(disagree_count - 1, 0) WHERE id = p_flint_id;
      END IF;
    ELSE
      -- Switch vote
      UPDATE public.votes SET vote_type = p_vote_type WHERE flint_id = p_flint_id AND user_id = p_user_id;
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
    -- New vote
    INSERT INTO public.votes (flint_id, user_id, vote_type) VALUES (p_flint_id, p_user_id, p_vote_type);
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
$$;
