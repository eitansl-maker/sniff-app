-- allow a third shift kind: other (free text in note)
alter table public.sniff_shifts drop constraint if exists sniff_shifts_kind_check;
alter table public.sniff_shifts add constraint sniff_shifts_kind_check check(kind in('morning','evening','other'));
alter table public.sniff_shifts drop constraint if exists sniff_shifts_branch_id_day_kind_person_id_key;
alter table public.sniff_shifts add constraint sniff_shifts_unique unique nulls not distinct(branch_id,day,kind,person_id,note);
