-- Flintyo — full schema for a self-hosted / own-account Supabase project.
-- Paste this into the SQL Editor of your own Supabase project and run it once.

-- 1. Table -------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code text NOT NULL UNIQUE,
  state jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 2. Grants (required — PostgREST has no default privileges on public) --
GRANT SELECT, INSERT, UPDATE ON public.rooms TO anon;
GRANT SELECT, INSERT, UPDATE ON public.rooms TO authenticated;
GRANT ALL ON public.rooms TO service_role;

-- 3. Row Level Security -------------------------------------------------
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;

-- 4. Policies (open by design: anyone with a room code can play) --------
DROP POLICY IF EXISTS "Anyone can read rooms" ON public.rooms;
CREATE POLICY "Anyone can read rooms"   ON public.rooms FOR SELECT USING (true);

DROP POLICY IF EXISTS "Anyone can create rooms" ON public.rooms;
CREATE POLICY "Anyone can create rooms" ON public.rooms FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Anyone can update rooms" ON public.rooms;
CREATE POLICY "Anyone can update rooms" ON public.rooms FOR UPDATE USING (true) WITH CHECK (true);
-- No DELETE policy: rooms cannot be deleted from the client.

-- 5. updated_at trigger -------------------------------------------------
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SET search_path TO 'public'
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS update_rooms_updated_at ON public.rooms;
CREATE TRIGGER update_rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Realtime (live multiplayer sync) -----------------------------------
ALTER TABLE public.rooms REPLICA IDENTITY FULL;
DO $$
BEGIN
  ALTER PUBLICATION supabase_realtime ADD TABLE public.rooms;
EXCEPTION WHEN duplicate_object THEN
  NULL;
END
$$;
