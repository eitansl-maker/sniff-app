-- סניף: שחרור עובד להשאלה. עובד מסניף אחר משובץ רק אחרי ששוחרר ליום ולמשמרת (פעולה מודעת).
create table if not exists public.sniff_releases(id uuid primary key default gen_random_uuid(),person_id uuid not null references public.sniff_people on delete cascade,day date not null,kind text not null check(kind in('morning','evening','other')),released_by uuid default auth.uid(),created_at timestamptz default now(),unique(person_id,day,kind));
alter table public.sniff_releases enable row level security;
create or replace function public.sniff_can_edit_person(pid uuid) returns boolean language sql stable security definer set search_path=public as $$
 select exists(select 1 from public.sniff_people p where p.id=pid and public.sniff_can_edit_branch(p.branch_id))
$$;
grant execute on function public.sniff_can_edit_person(uuid) to authenticated;
drop policy if exists p_rel_r on public.sniff_releases;create policy p_rel_r on public.sniff_releases for select to authenticated using(public.sniff_can_edit_person(person_id));
drop policy if exists p_rel_w on public.sniff_releases;create policy p_rel_w on public.sniff_releases for all to authenticated using(public.sniff_can_edit_person(person_id)) with check(public.sniff_can_edit_person(person_id));
-- רשימת המשוחררים ליום (לכל מנהל בארגון): רק מי שעדיין לא משובץ באותה משמרת
create or replace function public.sniff_released(p_day date) returns table(person_id uuid,name text,phone text,emp_no text,branch_id uuid,branch_name text,kind text) language sql stable security definer set search_path=public as $$
 select p.id,p.name,p.phone,p.emp_no,p.branch_id,b.name,r.kind from public.sniff_releases r join public.sniff_people p on p.id=r.person_id join public.sniff_branches b on b.id=p.branch_id
 where r.day=p_day and p.active and p.org_id=public.sniff_my_org()
  and exists(select 1 from public.sniff_members m where m.user_id=auth.uid() and m.active and m.role in('hq','manager','area_manager','format_manager'))
  and not exists(select 1 from public.sniff_shifts s where s.person_id=r.person_id and s.day=r.day and s.kind=r.kind and s.status<>'cant')
$$;
grant execute on function public.sniff_released(date) to authenticated;
-- חסימה: שיבוץ עובד לסניף שאינו שלו דורש שחרור מתאים; השחרור נצרך עם השיבוץ
create or replace function public.sniff_require_release() returns trigger language plpgsql security definer set search_path=public as $$
declare home uuid;
begin
 select branch_id into home from public.sniff_people where id=new.person_id;
 if home is not null and home<>new.branch_id then
  if not exists(select 1 from public.sniff_releases r where r.person_id=new.person_id and r.day=new.day and r.kind=new.kind) then
   raise exception 'העובד לא שוחרר להשאלה למשמרת הזאת. מנהל הסניף שלו צריך לשחרר אותו קודם.';
  end if;
  delete from public.sniff_releases r where r.person_id=new.person_id and r.day=new.day and r.kind=new.kind;
 end if;
 return new;
end$$;
drop trigger if exists trg_sniff_require_release on public.sniff_shifts;
create trigger trg_sniff_require_release before insert on public.sniff_shifts for each row execute function public.sniff_require_release();
