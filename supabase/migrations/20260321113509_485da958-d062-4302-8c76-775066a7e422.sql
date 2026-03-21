-- Remove duplicate old triggers that cause double notifications
DROP TRIGGER IF EXISTS on_chat_created ON public.chats;
DROP TRIGGER IF EXISTS on_chat_match ON public.chats;
DROP TRIGGER IF EXISTS on_debate_created ON public.debates;
DROP TRIGGER IF EXISTS on_debate_status_change ON public.debates;