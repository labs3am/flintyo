
-- Enable pg_net for HTTP calls from triggers
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Trigger function to send email notification via edge function
CREATE OR REPLACE FUNCTION public.send_notification_email_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Call the edge function via pg_net
  PERFORM net.http_post(
    url := 'https://tyeqzhiwrymkrebhjvor.supabase.co/functions/v1/send-notification-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR5ZXF6aGl3cnlta3JlYmhqdm9yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM2ODI3MTIsImV4cCI6MjA4OTI1ODcxMn0.LH8oy8lYiCUMAT30B7dFOomhqgNahmF6STqVZfjEGcg'
    ),
    body := jsonb_build_object(
      'user_id', NEW.user_id,
      'type', NEW.type,
      'title', NEW.title,
      'message', NEW.message,
      'link', NEW.link
    )
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- Don't fail the notification insert if email sending fails
  RAISE WARNING 'send_notification_email_trigger failed: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- Attach trigger to notifications table
CREATE TRIGGER on_notification_created
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.send_notification_email_trigger();

-- Trigger function for comment notifications
CREATE OR REPLACE FUNCTION public.notify_comment()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  flint_author uuid;
  commenter_labs text;
BEGIN
  -- Get the flint author
  SELECT author_id INTO flint_author FROM public.flints WHERE id = NEW.flint_id;
  
  -- Don't notify if commenting on own flint
  IF flint_author IS NULL OR flint_author = NEW.user_id THEN
    RETURN NEW;
  END IF;

  -- Get commenter labs_id
  SELECT labs_id INTO commenter_labs FROM public.users WHERE id = NEW.user_id;

  -- Insert notification (which will trigger the email via on_notification_created)
  INSERT INTO public.notifications (user_id, type, title, message, link)
  VALUES (
    flint_author,
    'comment',
    '💬 New Comment',
    COALESCE(commenter_labs, 'Someone') || ' commented on your flint',
    NULL
  );
  
  RETURN NEW;
END;
$$;

-- Attach comment notification trigger
CREATE TRIGGER on_comment_created
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_comment();

-- Update increment_points to detect rank changes and notify
CREATE OR REPLACE FUNCTION public.increment_points(user_id_input uuid, amount integer)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  old_rank text;
  new_rank text;
  new_points integer;
BEGIN
  -- Get current rank
  SELECT rank INTO old_rank FROM public.users WHERE id = user_id_input;

  -- Update points
  UPDATE public.users
  SET points = points + amount
  WHERE id = user_id_input;
  
  -- Get new points
  SELECT points INTO new_points FROM public.users WHERE id = user_id_input;

  -- Calculate new rank
  new_rank := CASE
    WHEN new_points >= 50000 THEN 'Gold'
    WHEN new_points >= 10000 THEN 'Amethyst'
    WHEN new_points >= 2501 THEN 'Cobalt'
    WHEN new_points >= 501 THEN 'Copper'
    ELSE 'Lead'
  END;
  
  -- Update rank
  UPDATE public.users
  SET rank = new_rank
  WHERE id = user_id_input;

  -- If rank changed, create notification (which triggers email)
  IF old_rank IS DISTINCT FROM new_rank THEN
    INSERT INTO public.notifications (user_id, type, title, message, link)
    VALUES (
      user_id_input,
      'rank_change',
      '🎖️ Rank Up!',
      'Congratulations! You''ve reached ' || new_rank || ' rank!',
      '/profile'
    );
  END IF;
END;
$$;
