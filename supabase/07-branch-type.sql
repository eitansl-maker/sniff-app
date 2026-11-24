alter table public.sniff_branches add column if not exists branch_type text not null default 'regular' check(branch_type in('regular','outlet'));
update public.sniff_branches set branch_type='outlet' where name='שילת';
