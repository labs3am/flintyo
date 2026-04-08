
-- Create app_role enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  labs_id TEXT NOT NULL UNIQUE,
  name TEXT,
  email TEXT,
  country TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  rank TEXT NOT NULL DEFAULT 'Lead',
  posts_count INTEGER NOT NULL DEFAULT 0,
  debates_won INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Flints table
CREATE TABLE public.flints (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Random',
  is_saved BOOLEAN NOT NULL DEFAULT false,
  agree_count INTEGER NOT NULL DEFAULT 0,
  disagree_count INTEGER NOT NULL DEFAULT 0,
  audience TEXT NOT NULL DEFAULT 'Global',
  audience_country TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);
ALTER TABLE public.flints ENABLE ROW LEVEL SECURITY;

-- Comments table
CREATE TABLE public.comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flint_id UUID REFERENCES public.flints(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- User votes table (prevent double voting)
CREATE TABLE public.user_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  flint_id UUID REFERENCES public.flints(id) ON DELETE CASCADE NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('agree', 'disagree')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, flint_id)
);
ALTER TABLE public.user_votes ENABLE ROW LEVEL SECURITY;

-- Debates table
CREATE TABLE public.debates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flint_id UUID REFERENCES public.flints(id) ON DELETE CASCADE NOT NULL,
  user_a UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  user_b UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'finished')),
  winner UUID REFERENCES public.profiles(id),
  votes_a INTEGER NOT NULL DEFAULT 0,
  votes_b INTEGER NOT NULL DEFAULT 0,
  votes_draw INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);
ALTER TABLE public.debates ENABLE ROW LEVEL SECURITY;

-- Debate messages
CREATE TABLE public.debate_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  debate_id UUID REFERENCES public.debates(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.debate_messages ENABLE ROW LEVEL SECURITY;

-- Debate votes
CREATE TABLE public.debate_votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  debate_id UUID REFERENCES public.debates(id) ON DELETE CASCADE NOT NULL,
  voter_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  voted_for TEXT NOT NULL CHECK (voted_for IN ('user_a', 'user_b', 'draw')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (debate_id, voter_id)
);
ALTER TABLE public.debate_votes ENABLE ROW LEVEL SECURITY;

-- Chats table (Let's Talk)
CREATE TABLE public.chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_a UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  user_b UUID REFERENCES public.profiles(id),
  topic TEXT NOT NULL,
  mood TEXT,
  status TEXT NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting', 'active', 'ended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ
);
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;

-- Chat messages
CREATE TABLE public.messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  chat_id UUID REFERENCES public.chats(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Reports table
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  flint_id UUID REFERENCES public.flints(id) ON DELETE CASCADE,
  reported_by UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  reason TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- ============ RLS POLICIES ============

-- Profiles: anyone authenticated can read, users can update own
CREATE POLICY "Anyone can view profiles" ON public.profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE TO authenticated USING (id = auth.uid());
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (id = auth.uid());

-- Flints: authenticated can read active, authors can insert/delete own
CREATE POLICY "Anyone can view active flints" ON public.flints FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create flints" ON public.flints FOR INSERT TO authenticated WITH CHECK (author_id = auth.uid());
CREATE POLICY "Users can delete own flints" ON public.flints FOR DELETE TO authenticated USING (author_id = auth.uid());
CREATE POLICY "Users can update own flints" ON public.flints FOR UPDATE TO authenticated USING (author_id = auth.uid());

-- Comments
CREATE POLICY "Anyone can view comments" ON public.comments FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create comments" ON public.comments FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users can delete own comments" ON public.comments FOR DELETE TO authenticated USING (user_id = auth.uid());

-- User votes
CREATE POLICY "Anyone can view votes" ON public.user_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create votes" ON public.user_votes FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());

-- Debates
CREATE POLICY "Anyone can view debates" ON public.debates FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can create debates" ON public.debates FOR INSERT TO authenticated WITH CHECK (user_a = auth.uid());
CREATE POLICY "Participants can update debates" ON public.debates FOR UPDATE TO authenticated USING (user_a = auth.uid() OR user_b = auth.uid());

-- Debate messages
CREATE POLICY "Anyone can view debate messages" ON public.debate_messages FOR SELECT TO authenticated USING (true);
CREATE POLICY "Participants can send debate messages" ON public.debate_messages FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());

-- Debate votes
CREATE POLICY "Anyone can view debate votes" ON public.debate_votes FOR SELECT TO authenticated USING (true);
CREATE POLICY "Users can cast debate votes" ON public.debate_votes FOR INSERT TO authenticated WITH CHECK (voter_id = auth.uid());

-- Chats
CREATE POLICY "Participants can view own chats" ON public.chats FOR SELECT TO authenticated USING (user_a = auth.uid() OR user_b = auth.uid());
CREATE POLICY "Users can create chats" ON public.chats FOR INSERT TO authenticated WITH CHECK (user_a = auth.uid());
CREATE POLICY "Participants can update chats" ON public.chats FOR UPDATE TO authenticated USING (user_a = auth.uid() OR user_b = auth.uid());

-- Messages
CREATE POLICY "Participants can view chat messages" ON public.messages FOR SELECT TO authenticated USING (
  EXISTS (SELECT 1 FROM public.chats WHERE id = chat_id AND (user_a = auth.uid() OR user_b = auth.uid()))
);
CREATE POLICY "Users can send messages" ON public.messages FOR INSERT TO authenticated WITH CHECK (sender_id = auth.uid());

-- Reports
CREATE POLICY "Users can create reports" ON public.reports FOR INSERT TO authenticated WITH CHECK (reported_by = auth.uid());
CREATE POLICY "Users can view own reports" ON public.reports FOR SELECT TO authenticated USING (reported_by = auth.uid());

-- User roles
CREATE POLICY "Users can view own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

-- ============ FUNCTIONS & TRIGGERS ============

-- Function to generate LabsID
CREATE OR REPLACE FUNCTION public.generate_labs_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_id TEXT;
  exists_already BOOLEAN;
BEGIN
  LOOP
    new_id := 'LabsID_' || floor(random() * 90000 + 10000)::TEXT;
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE labs_id = new_id) INTO exists_already;
    EXIT WHEN NOT exists_already;
  END LOOP;
  RETURN new_id;
END;
$$;

-- Trigger to auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, labs_id, email, name, country)
  VALUES (
    NEW.id,
    generate_labs_id(),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'country', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Function to calculate rank from points
CREATE OR REPLACE FUNCTION public.calculate_rank(p INTEGER)
RETURNS TEXT
LANGUAGE plpgsql
AS $$
BEGIN
  IF p >= 10000 THEN RETURN 'Amethyst';
  ELSIF p >= 2501 THEN RETURN 'Cobalt';
  ELSIF p >= 501 THEN RETURN 'Copper';
  ELSE RETURN 'Lead';
  END IF;
END;
$$;

-- Trigger to update rank when points change
CREATE OR REPLACE FUNCTION public.update_rank()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.rank := calculate_rank(NEW.points);
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_points_change
  BEFORE UPDATE OF points ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_rank();

-- Function to handle vote on flint
CREATE OR REPLACE FUNCTION public.vote_on_flint(p_flint_id UUID, p_vote_type TEXT)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_votes (user_id, flint_id, vote_type)
  VALUES (auth.uid(), p_flint_id, p_vote_type);

  IF p_vote_type = 'agree' THEN
    UPDATE public.flints SET agree_count = agree_count + 1 WHERE id = p_flint_id;
    UPDATE public.profiles SET points = points + 1
    WHERE id = (SELECT author_id FROM public.flints WHERE id = p_flint_id);
  ELSE
    UPDATE public.flints SET disagree_count = disagree_count + 1 WHERE id = p_flint_id;
  END IF;
END;
$$;
