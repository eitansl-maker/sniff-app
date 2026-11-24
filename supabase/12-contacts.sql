-- סניף: ספר טלפונים. מספרי חירום קבועים נמצאים באפליקציה; כאן מספרי הארגון לפי היררכיה.
create table if not exists public.sniff_contacts(id uuid primary key default gen_random_uuid(),org_id uuid not null references public.sniff_orgs on delete cascade,unit_id uuid references public.sniff_units on delete cascade,branch_id uuid references public.sniff_branches on delete cascade,label text not null,phone text,email text,note text,sort int default 0,created_at timestamptz default now(),check(not(unit_id is not null and branch_id is not null)));
alter table public.sniff_contacts enable row level security;
-- שרשרת היחידות של המשתמש: היחידה שלו, או היחידה של הסניף שלו, וכל ההורים מעליה
create or replace function public.sniff_my_unit_chain() returns setof uuid language sql stable security definer set search_path=public as $$
 with recursive m as (select coalesce(mm.unit_id,(select b.unit_id from public.sniff_branches b where b.id=mm.branch_id)) as uid from public.sniff_members mm where mm.user_id=auth.uid() and mm.active),
 t as (select u.id,u.parent_id from public.sniff_units u join m on u.id=m.uid union select p.id,p.parent_id from public.sniff_units p join t on p.id=t.parent_id)
 select id from t
$$;
grant execute on function public.sniff_my_unit_chain() to authenticated;
-- האם המשתמש רשאי לערוך איש קשר ביחידה/סניף: מטה לכל הארגון, מנהל אזור/פורמט ליחידות שמתחתיו, מנהל סניף לסניפו
create or replace function public.sniff_can_edit_contact(p_unit uuid,p_branch uuid) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.sniff_members m where m.user_id=auth.uid() and m.active and (
   m.role='hq'
   or (m.role in('area_manager','format_manager') and ((p_branch is not null and p_branch in(select public.sniff_visible_branches())) or (p_unit is not null and p_unit in(with recursive t as (select u.id from public.sniff_units u where u.id=m.unit_id union select c.id from public.sniff_units c join t on c.parent_id=t.id) select id from t))))
   or (m.role='manager' and p_branch is not null and p_branch=m.branch_id)))
$$;
grant execute on function public.sniff_can_edit_contact(uuid,uuid) to authenticated;
drop policy if exists p_ct_r on public.sniff_contacts;
create policy p_ct_r on public.sniff_contacts for select to authenticated using(org_id=public.sniff_my_org() and ((unit_id is null and branch_id is null) or unit_id in(select public.sniff_my_unit_chain()) or branch_id in(select public.sniff_visible_branches()) or public.sniff_my_role()='hq'));
drop policy if exists p_ct_w on public.sniff_contacts;
create policy p_ct_w on public.sniff_contacts for all to authenticated using(org_id=public.sniff_my_org() and public.sniff_can_edit_contact(unit_id,branch_id)) with check(org_id=public.sniff_my_org() and public.sniff_can_edit_contact(unit_id,branch_id) and (unit_id is not null or branch_id is not null or public.sniff_my_role()='hq'));
