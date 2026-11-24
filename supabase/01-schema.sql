-- סניף: סכמה כללית לרשת > סניפים > משתמשים. אין כאן מידע עסקי. בטוח להרצה חוזרת.
create table if not exists public.sniff_orgs(id uuid primary key default gen_random_uuid(),name text not null,created_at timestamptz default now());
create table if not exists public.sniff_branches(id uuid primary key default gen_random_uuid(),org_id uuid not null references public.sniff_orgs on delete cascade,name text not null,number text,region text,created_at timestamptz default now());
create table if not exists public.sniff_members(user_id uuid primary key references auth.users on delete cascade,org_id uuid not null references public.sniff_orgs on delete cascade,branch_id uuid references public.sniff_branches on delete set null,role text not null check(role in('hq','manager','employee')),display_name text,title text,active boolean default true,created_at timestamptz default now());
create table if not exists public.sniff_invites(email text primary key,org_id uuid not null references public.sniff_orgs on delete cascade,branch_id uuid references public.sniff_branches on delete set null,role text not null check(role in('hq','manager','employee')),title text,created_at timestamptz default now());
create table if not exists public.sniff_brands(id uuid primary key default gen_random_uuid(),org_id uuid not null references public.sniff_orgs on delete cascade,slug text not null,name text not null,he_name text,origin text,status text not null default 'active' check(status in('active','inactive')),type text,audience text,points jsonb default '[]',tags text[] default '{}',sort int default 0,unique(org_id,slug));
create table if not exists public.sniff_models(id uuid primary key default gen_random_uuid(),brand_id uuid not null references public.sniff_brands on delete cascade,name text not null,audience text,tags text[] default '{}',sort int default 0);
create table if not exists public.sniff_content(org_id uuid not null references public.sniff_orgs on delete cascade,kind text not null,body jsonb not null,primary key(org_id,kind));
-- מקום לכמויות לפי סניף (לא בשימוש בשלב הזה)
create table if not exists public.sniff_stock(branch_id uuid not null references public.sniff_branches on delete cascade,model_id uuid references public.sniff_models on delete cascade,sku text,size text,color text,qty int default 0,location text,updated_at timestamptz default now());

create or replace function public.sniff_my_org() returns uuid language sql stable security definer set search_path=public as $$select org_id from public.sniff_members where user_id=auth.uid() and active$$;
create or replace function public.sniff_my_role() returns text language sql stable security definer set search_path=public as $$select role from public.sniff_members where user_id=auth.uid() and active$$;
-- בכניסה ראשונה: מי שהוזמן במייל מצטרף אוטומטית לרשת ולתפקיד שהוגדרו לו
create or replace function public.sniff_claim_invite() returns text language plpgsql security definer set search_path=public as $$
declare i public.sniff_invites; em text:=lower(auth.jwt()->>'email');
begin
 if exists(select 1 from public.sniff_members where user_id=auth.uid()) then return 'member'; end if;
 select * into i from public.sniff_invites where lower(email)=em;
 if not found then return 'none'; end if;
 insert into public.sniff_members(user_id,org_id,branch_id,role,title,display_name) values(auth.uid(),i.org_id,i.branch_id,i.role,i.title,auth.jwt()->'user_metadata'->>'full_name');
 delete from public.sniff_invites where lower(email)=em;
 return 'joined';
end$$;
grant execute on function public.sniff_claim_invite() to authenticated;

alter table public.sniff_orgs enable row level security;alter table public.sniff_branches enable row level security;alter table public.sniff_members enable row level security;
alter table public.sniff_invites enable row level security;alter table public.sniff_brands enable row level security;alter table public.sniff_models enable row level security;
alter table public.sniff_content enable row level security;alter table public.sniff_stock enable row level security;
drop policy if exists p_org_r on public.sniff_orgs;create policy p_org_r on public.sniff_orgs for select to authenticated using(id=public.sniff_my_org());
drop policy if exists p_br_r on public.sniff_branches;create policy p_br_r on public.sniff_branches for select to authenticated using(org_id=public.sniff_my_org());
drop policy if exists p_br_w on public.sniff_branches;create policy p_br_w on public.sniff_branches for all to authenticated using(org_id=public.sniff_my_org() and public.sniff_my_role()='hq') with check(org_id=public.sniff_my_org() and public.sniff_my_role()='hq');
drop policy if exists p_mem_r on public.sniff_members;create policy p_mem_r on public.sniff_members for select to authenticated using(org_id=public.sniff_my_org());
drop policy if exists p_mem_w on public.sniff_members;create policy p_mem_w on public.sniff_members for all to authenticated using(org_id=public.sniff_my_org() and public.sniff_my_role() in('hq','manager')) with check(org_id=public.sniff_my_org() and public.sniff_my_role() in('hq','manager'));
drop policy if exists p_inv_w on public.sniff_invites;create policy p_inv_w on public.sniff_invites for all to authenticated using(org_id=public.sniff_my_org() and public.sniff_my_role() in('hq','manager')) with check(org_id=public.sniff_my_org() and public.sniff_my_role() in('hq','manager'));
drop policy if exists p_brand_r on public.sniff_brands;create policy p_brand_r on public.sniff_brands for select to authenticated using(org_id=public.sniff_my_org());
drop policy if exists p_brand_w on public.sniff_brands;create policy p_brand_w on public.sniff_brands for all to authenticated using(org_id=public.sniff_my_org() and public.sniff_my_role()='hq') with check(org_id=public.sniff_my_org() and public.sniff_my_role()='hq');
drop policy if exists p_model_r on public.sniff_models;create policy p_model_r on public.sniff_models for select to authenticated using(exists(select 1 from public.sniff_brands b where b.id=brand_id and b.org_id=public.sniff_my_org()));
drop policy if exists p_model_w on public.sniff_models;create policy p_model_w on public.sniff_models for all to authenticated using(public.sniff_my_role()='hq' and exists(select 1 from public.sniff_brands b where b.id=brand_id and b.org_id=public.sniff_my_org())) with check(public.sniff_my_role()='hq' and exists(select 1 from public.sniff_brands b where b.id=brand_id and b.org_id=public.sniff_my_org()));
drop policy if exists p_cont_r on public.sniff_content;create policy p_cont_r on public.sniff_content for select to authenticated using(org_id=public.sniff_my_org());
drop policy if exists p_cont_w on public.sniff_content;create policy p_cont_w on public.sniff_content for all to authenticated using(org_id=public.sniff_my_org() and public.sniff_my_role()='hq') with check(org_id=public.sniff_my_org() and public.sniff_my_role()='hq');
drop policy if exists p_stock_r on public.sniff_stock;create policy p_stock_r on public.sniff_stock for select to authenticated using(exists(select 1 from public.sniff_branches b where b.id=branch_id and b.org_id=public.sniff_my_org()));

-- תוספת: כותרת תפקיד לכל משתמש (למשל מנהלת סניף שילת)
alter table public.sniff_members add column if not exists title text;
alter table public.sniff_invites add column if not exists title text;
