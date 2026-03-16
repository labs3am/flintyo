
-- Daily task completions tracking
CREATE TABLE public.daily_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  task_type text NOT NULL,
  completed_at timestamp with time zone NOT NULL DEFAULT now(),
  points_awarded integer NOT NULL DEFAULT 0,
  task_date date NOT NULL DEFAULT CURRENT_DATE,
  UNIQUE (user_id, task_type, task_date)
);

ALTER TABLE public.daily_tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own daily tasks"
  ON public.daily_tasks FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own daily tasks"
  ON public.daily_tasks FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- Function to complete a daily task (idempotent - only awards once per day)
CREATE OR REPLACE FUNCTION public.complete_daily_task(
  p_user_id uuid,
  p_task_type text,
  p_points integer
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  already_done boolean;
BEGIN
  -- Check if already completed today
  SELECT EXISTS(
    SELECT 1 FROM public.daily_tasks
    WHERE user_id = p_user_id
      AND task_type = p_task_type
      AND task_date = CURRENT_DATE
  ) INTO already_done;

  IF already_done THEN
    RETURN false;
  END IF;

  -- Insert completion
  INSERT INTO public.daily_tasks (user_id, task_type, points_awarded, task_date)
  VALUES (p_user_id, p_task_type, p_points, CURRENT_DATE);

  -- Award points
  PERFORM public.increment_points(p_user_id, p_points);

  RETURN true;
END;
$$;
