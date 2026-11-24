-- chain catalog: one row per model (grouped from products by model code); read-only for staff, written by HQ
create table if not exists public.sniff_catalog(
 id uuid primary key default gen_random_uuid(),
 org_id uuid not null references public.sniff_orgs on delete cascade,
 brand text not null,
 model_code text not null,
 title text not null,
 product_type text,
 tags text[] default '{}',
 colors text[] default '{}',
 price_min numeric,
 price_max numeric,
 available boolean default true,
 image text,
 url text,
 unique(org_id,model_code)
);
create index if not exists sniff_catalog_brand on public.sniff_catalog(org_id,brand);
alter table public.sniff_catalog enable row level security;
drop policy if exists p_cat_r on public.sniff_catalog;
create policy p_cat_r on public.sniff_catalog for select to authenticated using(org_id=public.sniff_my_org());
drop policy if exists p_cat_w on public.sniff_catalog;
create policy p_cat_w on public.sniff_catalog for all to authenticated using(org_id=public.sniff_my_org() and public.sniff_my_role()='hq') with check(org_id=public.sniff_my_org() and public.sniff_my_role()='hq');
