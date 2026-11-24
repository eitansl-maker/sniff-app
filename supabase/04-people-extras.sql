-- employee number and profile photo for staff list
alter table public.sniff_people add column if not exists emp_no text;
alter table public.sniff_people add column if not exists avatar_url text;
create or replace function public.sniff_touch(p_avatar text) returns void language sql security definer set search_path=public as $$
 update public.sniff_people set avatar_url=p_avatar where user_id=auth.uid() and p_avatar is not null
$$;
grant execute on function public.sniff_touch(text) to authenticated;
