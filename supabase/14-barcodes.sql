-- סניף: ברקודים. הטבלה גדלה משימוש (ברקוד לא מוכר מקושר פעם אחת לדגם/מידה/צבע) ויכולה להיטען בבת אחת מקובץ הרשת.
create table if not exists public.sniff_barcodes(
 org_id uuid not null references public.sniff_orgs on delete cascade,
 barcode text not null,
 brand text,title text,model_code text,size text,color text,sku text,
 created_by uuid default auth.uid(),created_at timestamptz default now(),
 primary key(org_id,barcode));
alter table public.sniff_barcodes enable row level security;
drop policy if exists p_bc_r on public.sniff_barcodes;create policy p_bc_r on public.sniff_barcodes for select to authenticated using(org_id=public.sniff_my_org());
drop policy if exists p_bc_i on public.sniff_barcodes;create policy p_bc_i on public.sniff_barcodes for insert to authenticated with check(org_id=public.sniff_my_org() and created_by=auth.uid());
drop policy if exists p_bc_u on public.sniff_barcodes;create policy p_bc_u on public.sniff_barcodes for update to authenticated using(org_id=public.sniff_my_org() and public.sniff_my_role() in('hq','manager','area_manager','format_manager')) with check(org_id=public.sniff_my_org());
drop policy if exists p_bc_d on public.sniff_barcodes;create policy p_bc_d on public.sniff_barcodes for delete to authenticated using(org_id=public.sniff_my_org() and public.sniff_my_role() in('hq','manager','area_manager','format_manager'));
alter table public.sniff_lowstock add column if not exists barcode text;
