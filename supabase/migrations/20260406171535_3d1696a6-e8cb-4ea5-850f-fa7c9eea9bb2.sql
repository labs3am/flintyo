
-- Drop all triggers first
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP TRIGGER IF EXISTS set_flint_expiry_trigger ON public.flints;
DROP TRIGGER IF EXISTS on_comment_created ON public.comments;
DROP TRIGGER IF EXISTS on_debate_created ON public.debates;
DROP TRIGGER IF EXISTS on_debate_status_change ON public.debates;
DROP TRIGGER IF EXISTS on_chat_created ON public.chats;
DROP TRIGGER IF EXISTS on_notification_created ON public.notifications;

-- Drop all tables
DROP TABLE IF EXISTS public.debate_votes CASCADE;
DROP TABLE IF EXISTS public.debate_messages CASCADE;
DROP TABLE IF EXISTS public.debates CASCADE;
DROP TABLE IF EXISTS public.votes CASCADE;
DROP TABLE IF EXISTS public.comments CASCADE;
DROP TABLE IF EXISTS public.reports CASCADE;
DROP TABLE IF EXISTS public.notifications CASCADE;
DROP TABLE IF EXISTS public.daily_tasks CASCADE;
DROP TABLE IF EXISTS public.messages CASCADE;
DROP TABLE IF EXISTS public.chats CASCADE;
DROP TABLE IF EXISTS public.chat_queue CASCADE;
DROP TABLE IF EXISTS public.flints CASCADE;
DROP TABLE IF EXISTS public.users CASCADE;

-- Drop the view
DROP VIEW IF EXISTS public.user_profiles CASCADE;

-- Drop all functions
DROP FUNCTION IF EXISTS public.find_chat_match(text) CASCADE;
DROP FUNCTION IF EXISTS public.accept_debate(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.resolve_debate(uuid) CASCADE;
DROP FUNCTION IF EXISTS public.notify_comment() CASCADE;
DROP FUNCTION IF EXISTS public.send_notification_email_trigger() CASCADE;
DROP FUNCTION IF EXISTS public.increment_points(uuid, integer) CASCADE;
DROP FUNCTION IF EXISTS public.set_flint_expiry() CASCADE;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
DROP FUNCTION IF EXISTS public.cast_vote(uuid, uuid, text) CASCADE;
DROP FUNCTION IF EXISTS public.notify_clash_challenge() CASCADE;
DROP FUNCTION IF EXISTS public.notify_clash_accepted() CASCADE;
DROP FUNCTION IF EXISTS public.notify_chat_match() CASCADE;
DROP FUNCTION IF EXISTS public.complete_daily_task(uuid, text, integer) CASCADE;
DROP FUNCTION IF EXISTS public.complete_daily_task(text) CASCADE;
