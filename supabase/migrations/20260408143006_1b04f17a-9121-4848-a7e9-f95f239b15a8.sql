-- 1. Fix profiles UPDATE privilege escalation
-- Add a trigger to prevent modification of system-managed columns
CREATE OR REPLACE FUNCTION public.protect_profile_system_columns()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.points := OLD.points;
  NEW.rank := OLD.rank;
  NEW.labs_id := OLD.labs_id;
  NEW.debates_won := OLD.debates_won;
  NEW.posts_count := OLD.posts_count;
  NEW.id := OLD.id;
  NEW.created_at := OLD.created_at;
  NEW.email := OLD.email;
  RETURN NEW;
END;
$$;

CREATE TRIGGER protect_profile_system_columns
BEFORE UPDATE ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.protect_profile_system_columns();

-- 2. Fix debate_messages INSERT bypass - require participant membership
DROP POLICY IF EXISTS "Participants can send debate messages" ON public.debate_messages;
CREATE POLICY "Participants can send debate messages"
  ON public.debate_messages FOR INSERT TO authenticated
  WITH CHECK (
    sender_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM debates
      WHERE debates.id = debate_id
      AND (debates.user_a = auth.uid() OR debates.user_b = auth.uid())
      AND debates.status = 'active'
    )
  );