
CREATE OR REPLACE FUNCTION public.resolve_debate(p_debate_id uuid)
RETURNS void
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
  v_status TEXT;
  v_ends_at TIMESTAMPTZ;
  v_voter RECORD;
BEGIN
  -- Auth check
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Fetch debate info
  SELECT status, ends_at, user_a, user_b
  INTO v_status, v_ends_at, v_user_a, v_user_b
  FROM public.debates WHERE id = p_debate_id;

  IF v_status IS NULL THEN
    RAISE EXCEPTION 'Debate not found';
  END IF;

  -- Only active debates can be resolved
  IF v_status != 'active' THEN
    RAISE EXCEPTION 'Debate is not active';
  END IF;

  -- Timing guard: debate must have ended
  IF v_ends_at > now() THEN
    RAISE EXCEPTION 'Debate has not ended yet';
  END IF;

  -- Count votes
  SELECT COUNT(*) INTO votes_a FROM public.debate_votes
  WHERE debate_id = p_debate_id AND voted_for = v_user_a;

  SELECT COUNT(*) INTO votes_b FROM public.debate_votes
  WHERE debate_id = p_debate_id AND voted_for = v_user_b;

  IF votes_a > votes_b THEN
    v_winner := v_user_a;
  ELSIF votes_b > votes_a THEN
    v_winner := v_user_b;
  ELSE
    v_winner := NULL;
  END IF;

  UPDATE public.debates
  SET status = 'finished', winner = v_winner
  WHERE id = p_debate_id;

  -- Award winner +50 points
  IF v_winner IS NOT NULL THEN
    PERFORM public.increment_points(v_winner, 50);
  END IF;

  -- Award voters +5 points each
  FOR v_voter IN 
    SELECT DISTINCT voter_id FROM public.debate_votes 
    WHERE debate_id = p_debate_id 
    AND voter_id != v_user_a 
    AND voter_id != v_user_b
  LOOP
    PERFORM public.increment_points(v_voter.voter_id, 5);
  END LOOP;
END;
$$;
