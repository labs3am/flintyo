
ALTER FUNCTION public.generate_labs_id() SET search_path = public;
ALTER FUNCTION public.calculate_rank(INTEGER) SET search_path = public;
ALTER FUNCTION public.update_rank() SET search_path = public;
ALTER FUNCTION public.vote_on_flint(UUID, TEXT) SET search_path = public;
