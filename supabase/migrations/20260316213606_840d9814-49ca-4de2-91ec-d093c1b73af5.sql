
-- Debate messages for live chat in debate room
CREATE TABLE public.debate_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  debate_id UUID NOT NULL REFERENCES public.debates(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.debate_messages ENABLE ROW LEVEL SECURITY;

-- Anyone authenticated can read debate messages (audience)
CREATE POLICY "Anyone can read debate messages" ON public.debate_messages
  FOR SELECT TO authenticated USING (true);

-- Only debate participants can send messages
CREATE POLICY "Participants can send debate messages" ON public.debate_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = sender_id
    AND EXISTS (
      SELECT 1 FROM public.debates
      WHERE debates.id = debate_id
      AND (debates.user_a = auth.uid() OR debates.user_b = auth.uid())
      AND debates.status = 'active'
    )
  );

-- Debate votes for audience voting
CREATE TABLE public.debate_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  debate_id UUID NOT NULL REFERENCES public.debates(id) ON DELETE CASCADE,
  voter_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  voted_for UUID REFERENCES public.users(id) ON DELETE CASCADE, -- NULL = draw
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (debate_id, voter_id)
);

ALTER TABLE public.debate_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read debate votes" ON public.debate_votes
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can cast debate vote" ON public.debate_votes
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = voter_id);

-- Add ends_at column to debates for the 3-min timer
ALTER TABLE public.debates ADD COLUMN IF NOT EXISTS ends_at TIMESTAMPTZ;

-- Enable realtime on debate_messages and debates
ALTER PUBLICATION supabase_realtime ADD TABLE public.debate_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.debates;

-- Function to resolve debate winner
CREATE OR REPLACE FUNCTION public.resolve_debate(p_debate_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  votes_a INT;
  votes_b INT;
  v_user_a UUID;
  v_user_b UUID;
  v_winner UUID;
BEGIN
  SELECT user_a, user_b INTO v_user_a, v_user_b
  FROM public.debates WHERE id = p_debate_id;

  SELECT COUNT(*) INTO votes_a FROM public.debate_votes
  WHERE debate_id = p_debate_id AND voted_for = v_user_a;

  SELECT COUNT(*) INTO votes_b FROM public.debate_votes
  WHERE debate_id = p_debate_id AND voted_for = v_user_b;

  IF votes_a > votes_b THEN
    v_winner := v_user_a;
  ELSIF votes_b > votes_a THEN
    v_winner := v_user_b;
  ELSE
    v_winner := NULL; -- draw
  END IF;

  UPDATE public.debates
  SET status = 'finished', winner = v_winner
  WHERE id = p_debate_id;

  IF v_winner IS NOT NULL THEN
    PERFORM public.increment_points(v_winner, 50);
  END IF;
END;
$$;
