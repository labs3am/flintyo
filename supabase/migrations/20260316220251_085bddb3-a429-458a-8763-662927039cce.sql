
-- Add interests column to users table
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS interests text[] DEFAULT '{}';

-- Update increment_points to include Gold rank tier (50k+)
CREATE OR REPLACE FUNCTION public.increment_points(user_id_input uuid, amount integer)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.users
  SET points = points + amount
  WHERE id = user_id_input;
  
  UPDATE public.users
  SET rank = CASE
    WHEN points >= 50000 THEN 'Gold'
    WHEN points >= 10000 THEN 'Amethyst'
    WHEN points >= 2501 THEN 'Cobalt'
    WHEN points >= 501 THEN 'Copper'
    ELSE 'Lead'
  END
  WHERE id = user_id_input;
END;
$$;
