-- employees may request a shift for themselves; a manager approves or rejects
alter table public.sniff_shifts drop constraint if exists sniff_shifts_status_check;
alter table public.sniff_shifts add constraint sniff_shifts_status_check check(status in('planned','confirmed','cant','requested'));
drop policy if exists p_sh_req on public.sniff_shifts;
create policy p_sh_req on public.sniff_shifts for insert to authenticated with check(status='requested' and person_id in(select id from public.sniff_people where user_id=auth.uid() and active) and branch_id in(select public.sniff_visible_branches()));
drop policy if exists p_sh_reqdel on public.sniff_shifts;
create policy p_sh_reqdel on public.sniff_shifts for delete to authenticated using(status='requested' and person_id in(select id from public.sniff_people where user_id=auth.uid()));
