-- סניף: השאלת עובדים בין סניפים. כללי בלבד, בטוח להרצה חוזרת.
-- 1) רשימת עובדים מסניפים אחרים בארגון (למנהלים בלבד), לשיבוץ זמני
create or replace function public.sniff_loanable() returns table(id uuid,name text,phone text,emp_no text,branch_id uuid,branch_name text) language sql stable security definer set search_path=public as $$
 select p.id,p.name,p.phone,p.emp_no,p.branch_id,b.name from public.sniff_people p join public.sniff_branches b on b.id=p.branch_id
 where p.active and p.org_id=public.sniff_my_org()
  and exists(select 1 from public.sniff_members m where m.user_id=auth.uid() and m.active and m.role in('hq','manager','area_manager','format_manager'))
$$;
grant execute on function public.sniff_loanable() to authenticated;
-- 2) עובד מושאל נראה לסניף שהוא משובץ בו (שם, טלפון, מספר עובד), רק אם יש לו משמרת שם
drop policy if exists p_ppl_loan on public.sniff_people;
create policy p_ppl_loan on public.sniff_people for select to authenticated using(id in(select person_id from public.sniff_shifts where branch_id in(select public.sniff_visible_branches())));
