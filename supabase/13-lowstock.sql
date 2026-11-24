-- סניף: "אוזל / להזמנה". כל עובד מסמן, רק מנהל מעדכן סטטוס.
create table if not exists public.sniff_lowstock(
 id uuid primary key default gen_random_uuid(),
 branch_id uuid not null references public.sniff_branches on delete cascade,
 brand text,title text not null,model_code text,size text,color text,note text,
 status text not null default 'open' check(status in('open','ordered','closed')),
 marked_by uuid default auth.uid(),marked_by_name text,created_at timestamptz default now(),
 status_by uuid,status_at timestamptz);
create index if not exists sniff_lowstock_b on public.sniff_lowstock(branch_id,status);
alter table public.sniff_lowstock enable row level security;
drop policy if exists p_ls_r on public.sniff_lowstock;create policy p_ls_r on public.sniff_lowstock for select to authenticated using(branch_id in(select public.sniff_visible_branches()));
drop policy if exists p_ls_i on public.sniff_lowstock;create policy p_ls_i on public.sniff_lowstock for insert to authenticated with check(branch_id in(select public.sniff_visible_branches()) and marked_by=auth.uid() and status='open');
drop policy if exists p_ls_u on public.sniff_lowstock;create policy p_ls_u on public.sniff_lowstock for update to authenticated using(public.sniff_can_edit_branch(branch_id)) with check(public.sniff_can_edit_branch(branch_id));
drop policy if exists p_ls_d on public.sniff_lowstock;create policy p_ls_d on public.sniff_lowstock for delete to authenticated using(public.sniff_can_edit_branch(branch_id) or (marked_by=auth.uid() and status='open'));
