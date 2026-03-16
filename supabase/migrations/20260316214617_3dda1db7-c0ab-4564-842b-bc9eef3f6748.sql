
-- Notifications table
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL, -- 'clash_challenge', 'clash_accepted', 'clash_result', 'chat_match'
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  link TEXT, -- optional route to navigate to
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own notifications" ON public.notifications
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications" ON public.notifications
  FOR UPDATE TO authenticated USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "System can insert notifications" ON public.notifications
  FOR INSERT TO authenticated WITH CHECK (true);

-- Enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;

-- Trigger: notify on clash challenge (debate created with status=pending)
CREATE OR REPLACE FUNCTION public.notify_clash_challenge()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  challenger_labs TEXT;
BEGIN
  SELECT labs_id INTO challenger_labs FROM public.users WHERE id = NEW.user_a;

  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (
    NEW.user_b,
    'clash_challenge',
    '⚔️ Clash Challenge!',
    challenger_labs || ' challenged you to a debate!',
    '/debate/' || NEW.id
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_debate_created
  AFTER INSERT ON public.debates
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION public.notify_clash_challenge();

-- Trigger: notify when clash is accepted
CREATE OR REPLACE FUNCTION public.notify_clash_accepted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.status = 'pending' AND NEW.status = 'active' THEN
    INSERT INTO public.notifications (user_id, type, title, message, link)
    VALUES (
      NEW.user_a,
      'clash_accepted',
      '⚔️ Challenge Accepted!',
      'Your clash debate is starting now!',
      '/debate/' || NEW.id
    );
  END IF;

  -- Notify both on result
  IF OLD.status = 'active' AND NEW.status = 'finished' THEN
    INSERT INTO public.notifications (user_id, type, title, message, link)
    VALUES
      (NEW.user_a, 'clash_result', '🏆 Clash Finished', 
       CASE WHEN NEW.winner = NEW.user_a THEN 'You won the debate! +50 pts'
            WHEN NEW.winner = NEW.user_b THEN 'You lost the debate'
            ELSE 'The debate ended in a draw' END,
       '/debate/' || NEW.id),
      (NEW.user_b, 'clash_result', '🏆 Clash Finished',
       CASE WHEN NEW.winner = NEW.user_b THEN 'You won the debate! +50 pts'
            WHEN NEW.winner = NEW.user_a THEN 'You lost the debate'
            ELSE 'The debate ended in a draw' END,
       '/debate/' || NEW.id);
  END IF;

  RETURN NEW;
END;
$$;

CREATE TRIGGER on_debate_status_change
  AFTER UPDATE ON public.debates
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_clash_accepted();

-- Trigger: notify on chat match
CREATE OR REPLACE FUNCTION public.notify_chat_match()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES
    (NEW.user_a, 'chat_match', '💬 Chat Matched!', 'You''ve been matched! Topic: ' || NEW.topic, '/talk'),
    (NEW.user_b, 'chat_match', '💬 Chat Matched!', 'You''ve been matched! Topic: ' || NEW.topic, '/talk');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_chat_created
  AFTER INSERT ON public.chats
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_chat_match();
