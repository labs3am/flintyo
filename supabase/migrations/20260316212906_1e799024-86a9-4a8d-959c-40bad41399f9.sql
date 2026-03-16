
-- Replace the trigger function with retry logic for unique LabsID
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_labs_id TEXT;
  attempts INT := 0;
BEGIN
  LOOP
    attempts := attempts + 1;
    new_labs_id := 'LabsID_' || floor(random() * 9000000 + 1000000)::int;
    BEGIN
      INSERT INTO public.users (id, email, labs_id, points, rank, country)
      VALUES (
        NEW.id,
        NEW.email,
        new_labs_id,
        0,
        'Lead',
        COALESCE(NEW.raw_user_meta_data->>'country', '')
      );
      RETURN NEW;
    EXCEPTION WHEN unique_violation THEN
      IF attempts >= 10 THEN
        RAISE EXCEPTION 'Could not generate unique LabsID after 10 attempts';
      END IF;
    END;
  END LOOP;
END;
$$;

-- Prevent users from updating their own labs_id
CREATE POLICY "Users cannot change labs_id" ON public.users
  FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- Drop the old permissive update policy and recreate with column restriction
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
