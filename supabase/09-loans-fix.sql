-- תיקון: p_ppl_loan יצרה לולאה בין sniff_people ל-sniff_shifts. הפונקציה קוראת משמרות בלי RLS.
create or replace function public.sniff_loaned_person_ids() returns setof uuid language sql stable security definer set search_path=public as $$
 select person_id from public.sniff_shifts where branch_id in(select public.sniff_visible_branches())
$$;
grant execute on function public.sniff_loaned_person_ids() to authenticated;
drop policy if exists p_ppl_loan on public.sniff_people;
create policy p_ppl_loan on public.sniff_people for select to authenticated using(id in(select public.sniff_loaned_person_ids()));
