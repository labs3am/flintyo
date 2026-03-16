
-- Function to safely increment user points
CREATE OR REPLACE FUNCTION public.increment_points(user_id_input UUID, amount INT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE public.users
  SET points = points + amount
  WHERE id = user_id_input;
  
  -- Auto-update rank based on points
  UPDATE public.users
  SET rank = CASE
    WHEN points >= 10000 THEN 'Amethyst'
    WHEN points >= 2501 THEN 'Cobalt'
    WHEN points >= 501 THEN 'Copper'
    ELSE 'Lead'
  END
  WHERE id = user_id_input;
END;
$$;
