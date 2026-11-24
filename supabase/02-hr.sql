-- סניף שלב 2: היררכיה ארגונית, אנשי צוות ומשמרות. כללי בלבד, בטוח להרצה חוזרת.
create table if not exists public.sniff_units(id uuid primary key default gen_random_uuid(),org_id uuid not null references public.sniff_orgs on delete cascade,parent_id uuid references public.sniff_units on delete cascade,kind text not null check(kind in('format','area')),name text not null);
alter table public.sniff_branches add column if not exists unit_id uuid references public.sniff_units on delete set null;
alter table public.sniff_members add column if not exists unit_id uuid references public.sniff_units on delete set null;
alter table public.sniff_invites add column if not exists unit_id uuid references public.sniff_units on delete set null;
alter table public.sniff_members drop constraint if exists sniff_members_role_check;
alter table public.sniff_members add constraint sniff_members_role_check check(role in('hq','format_manager','area_manager','manager','employee'));
alter table public.sniff_invites drop constraint if exists sniff_invites_role_check;
alter table public.sniff_invites add constraint sniff_invites_role_check check(role in('hq','format_manager','area_manager','manager','employee'));

create table if not exists public.sniff_people(id uuid primary key default gen_random_uuid(),org_id uuid not null references public.sniff_orgs on delete cascade,branch_id uuid not null references public.sniff_branches on delete cascade,name text not null,phone text,email text,title text,user_id uuid references auth.users on delete set null,active boolean default true,created_at timestamptz default now());
create table if not exists public.sniff_shifts(id uuid primary key default gen_random_uuid(),branch_id uuid not null references public.sniff_branches on delete cascade,person_id uuid not null references public.sniff_people on delete cascade,day date not null,kind text not null check(kind in('morning','evening')),status text not null default 'planned' check(status in('planned','confirmed','cant')),note text,unique(branch_id,day,kind,person_id));

-- אילו סניפים המשתמש רואה: מטה=הכל, מנהל אזור/פורמט=כל הסניפים שמתחת ליחידה שלו, מנהל/עובד=הסניף שלו
create or replace function public.sniff_visible_branches() returns setof uuid language sql stable security definer set search_path=public as $$
 with m as (select * from public.sniff_members where user_id=auth.uid() and active),
 sub as (with recursive t as (select u.id from public.sniff_units u,m where u.id=m.unit_id and m.role in('area_manager','format_manager') union all select c.id from public.sniff_units c join t on c.parent_id=t.id) select id from t)
 select b.id from public.sniff_branches b,m where b.org_id=m.org_id and (m.role='hq' or (m.role in('area_manager','format_manager') and b.unit_id in(select id from sub)) or (m.role in('manager','employee') and b.id=m.branch_id))
$$;
create or replace function public.sniff_can_edit_branch(bid uuid) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.sniff_members m where m.user_id=auth.uid() and m.active and m.role in('hq','manager','area_manager','format_manager')) and bid in(select public.sniff_visible_branches())
$$;
alter table public.sniff_units enable row level security;alter table public.sniff_people enable row level security;alter table public.sniff_shifts enable row level security;
drop policy if exists p_unit_r on public.sniff_units;create policy p_unit_r on public.sniff_units for select to authenticated using(org_id=public.sniff_my_org());
drop policy if exists p_unit_w on public.sniff_units;create policy p_unit_w on public.sniff_units for all to authenticated using(org_id=public.sniff_my_org() and public.sniff_my_role()='hq') with check(org_id=public.sniff_my_org() and public.sniff_my_role()='hq');
drop policy if exists p_ppl_r on public.sniff_people;create policy p_ppl_r on public.sniff_people for select to authenticated using(branch_id in(select public.sniff_visible_branches()));
drop policy if exists p_ppl_w on public.sniff_people;create policy p_ppl_w on public.sniff_people for all to authenticated using(public.sniff_can_edit_branch(branch_id)) with check(public.sniff_can_edit_branch(branch_id) and org_id=public.sniff_my_org());
drop policy if exists p_sh_r on public.sniff_shifts;create policy p_sh_r on public.sniff_shifts for select to authenticated using(branch_id in(select public.sniff_visible_branches()));
drop policy if exists p_sh_w on public.sniff_shifts;create policy p_sh_w on public.sniff_shifts for all to authenticated using(public.sniff_can_edit_branch(branch_id)) with check(public.sniff_can_edit_branch(branch_id));
-- עובד יכול לעדכן רק את הסטטוס של המשמרת של עצמו (אני יכול / לא יכול)
drop policy if exists p_sh_self on public.sniff_shifts;create policy p_sh_self on public.sniff_shifts for update to authenticated using(person_id in(select id from public.sniff_people where user_id=auth.uid())) with check(person_id in(select id from public.sniff_people where user_id=auth.uid()));
-- סניפים: כל אחד רואה רק את אלה שמותר לו
drop policy if exists p_br_r on public.sniff_branches;create policy p_br_r on public.sniff_branches for select to authenticated using(id in(select public.sniff_visible_branches()));
-- חברים: רואים רק בסניפים הנראים
drop policy if exists p_mem_r on public.sniff_members;create policy p_mem_r on public.sniff_members for select to authenticated using(user_id=auth.uid() or branch_id in(select public.sniff_visible_branches()));
-- בכניסה: קישור המשתמש לרשומת איש הצוות לפי המייל
create or replace function public.sniff_claim_invite() returns text language plpgsql security definer set search_path=public as $$
declare i public.sniff_invites; em text:=lower(auth.jwt()->>'email');
begin
 update public.sniff_people set user_id=auth.uid() where lower(email)=em and user_id is null;
 if exists(select 1 from public.sniff_members where user_id=auth.uid()) then return 'member'; end if;
 select * into i from public.sniff_invites where lower(email)=em;
 if not found then return 'none'; end if;
 insert into public.sniff_members(user_id,org_id,branch_id,unit_id,role,title,display_name) values(auth.uid(),i.org_id,i.branch_id,i.unit_id,i.role,i.title,auth.jwt()->'user_metadata'->>'full_name');
 delete from public.sniff_invites where lower(email)=em;
 return 'joined';
end$$;
grant execute on function public.sniff_claim_invite() to authenticated;
