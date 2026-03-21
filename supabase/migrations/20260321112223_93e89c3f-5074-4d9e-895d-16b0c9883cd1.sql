-- Drop existing triggers if they exist
DROP TRIGGER IF EXISTS on_notification_created ON public.notifications;
DROP TRIGGER IF EXISTS on_clash_challenge ON public.debates;
DROP TRIGGER IF EXISTS on_clash_status_change ON public.debates;
DROP TRIGGER IF EXISTS on_comment_created ON public.comments;
DROP TRIGGER IF EXISTS on_chat_matched ON public.chats;

-- Update trigger function to point to send-system-notification
CREATE OR REPLACE FUNCTION public.send_notification_email_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
BEGIN
  PERFORM net.http_post(
    url := 'https://tyeqzhiwrymkrebhjvor.supabase.co/functions/v1/send-system-notification',
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
  RAISE WARNING 'send_notification_email_trigger failed: %', SQLERRM;
  RETURN NEW;
END;
$function$;

-- Recreate all triggers
CREATE TRIGGER on_notification_created
  AFTER INSERT ON public.notifications
  FOR EACH ROW
  EXECUTE FUNCTION public.send_notification_email_trigger();

CREATE TRIGGER on_clash_challenge
  AFTER INSERT ON public.debates
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_clash_challenge();

CREATE TRIGGER on_clash_status_change
  AFTER UPDATE ON public.debates
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_clash_accepted();

CREATE TRIGGER on_comment_created
  AFTER INSERT ON public.comments
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_comment();

CREATE TRIGGER on_chat_matched
  AFTER INSERT ON public.chats
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_chat_match();