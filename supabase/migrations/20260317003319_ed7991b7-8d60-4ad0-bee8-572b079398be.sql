
-- Fix 1: Harden complete_daily_task to derive user_id and points server-side
CREATE OR REPLACE FUNCTION public.complete_daily_task(p_task_type text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  actual_user uuid := auth.uid();
  task_points integer;
  already_done boolean;
BEGIN
  IF actual_user IS NULL THEN RETURN false; END IF;

  task_points := CASE p_task_type
    WHEN 'post_flint' THEN 5
    WHEN 'vote_flint' THEN 2
    WHEN 'comment_flint' THEN 3
    WHEN 'start_chat' THEN 5
    WHEN 'clash_debate' THEN 5
    ELSE 0
  END;

  IF task_points = 0 THEN RETURN false; END IF;

  SELECT EXISTS(
    SELECT 1 FROM public.daily_tasks
    WHERE user_id = actual_user
      AND task_type = p_task_type
      AND task_date = CURRENT_DATE
  ) INTO already_done;

  IF already_done THEN RETURN false; END IF;

  INSERT INTO public.daily_tasks (user_id, task_type, points_awarded, task_date)
  VALUES (actual_user, p_task_type, task_points, CURRENT_DATE);

  PERFORM public.increment_points(actual_user, task_points);

  RETURN true;
END;
$$;

-- Fix 2: Restrict users table SELECT to own record only
DROP POLICY IF EXISTS "Users can read all profiles" ON public.users;

CREATE POLICY "Users can read own profile"
ON public.users FOR SELECT TO authenticated
USING (auth.uid() = id);

-- Create a public view for non-sensitive profile data
CREATE OR REPLACE VIEW public.user_profiles AS
SELECT id, labs_id, points, rank, country, created_at, interests
FROM public.users;

-- Grant access to the view
GRANT SELECT ON public.user_profiles TO authenticated;
GRANT SELECT ON public.user_profiles TO anon;
