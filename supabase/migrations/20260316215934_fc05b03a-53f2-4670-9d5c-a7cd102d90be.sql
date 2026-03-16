
-- Attach trigger for clash challenge notifications (on INSERT to debates)
CREATE TRIGGER on_clash_challenge
  AFTER INSERT ON public.debates
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_clash_challenge();

-- Attach trigger for clash accepted/finished notifications (on UPDATE to debates)
CREATE TRIGGER on_clash_status_change
  AFTER UPDATE ON public.debates
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_clash_accepted();

-- Attach trigger for chat match notifications (on INSERT to chats)
CREATE TRIGGER on_chat_match
  AFTER INSERT ON public.chats
  FOR EACH ROW
  EXECUTE FUNCTION public.notify_chat_match();
