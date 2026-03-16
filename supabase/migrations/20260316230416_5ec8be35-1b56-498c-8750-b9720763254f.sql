
CREATE OR REPLACE FUNCTION public.resolve_debate(p_debate_id uuid)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
DECLARE
  votes_a INT;
  votes_b INT;
  v_user_a UUID;
  v_user_b UUID;
  v_winner UUID;
  v_voter RECORD;
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
    v_winner := NULL;
  END IF;

  UPDATE public.debates
  SET status = 'finished', winner = v_winner
  WHERE id = p_debate_id;

  -- Award winner +50 points
  IF v_winner IS NOT NULL THEN
    PERFORM public.increment_points(v_winner, 50);
  END IF;

  -- Award viewers who voted +5 points each
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
