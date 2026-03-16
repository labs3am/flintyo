
-- Fix: Prevent debate participants from voting on their own debate
DROP POLICY IF EXISTS "Users can cast debate vote" ON public.debate_votes;

CREATE POLICY "Audience can cast debate vote" ON public.debate_votes
  FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = voter_id
    AND NOT EXISTS (
      SELECT 1 FROM public.debates
      WHERE debates.id = debate_votes.debate_id
      AND (debates.user_a = auth.uid() OR debates.user_b = auth.uid())
    )
  );
