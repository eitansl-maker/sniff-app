-- מניעת כפל שיבוץ: אותו עובד לא יכול להיות משובץ לאותה משמרת (בוקר/ערב) באותו יום, בשום סניף.
create or replace function public.sniff_no_double() returns trigger language plpgsql security definer set search_path=public as $$
begin
 if new.kind in('morning','evening') and new.status<>'cant' and exists(select 1 from public.sniff_shifts s where s.person_id=new.person_id and s.day=new.day and s.kind=new.kind and s.status<>'cant' and s.id<>new.id) then
  raise exception 'העובד כבר משובץ למשמרת הזאת ביום הזה (בסניף זה או באחר)';
 end if;
 return new;
end$$;
drop trigger if exists trg_sniff_no_double on public.sniff_shifts;
create trigger trg_sniff_no_double before insert or update on public.sniff_shifts for each row execute function public.sniff_no_double();
