-- Dodaje pola dla zmian obowiązujących tylko w konkretnej dacie.
alter table public.teacher_changes add column if not exists change_type text not null default 'replacement';
alter table public.teacher_changes add column if not exists replacement_subject text not null default '';
alter table public.teacher_changes add column if not exists replacement_teacher text not null default '';
alter table public.teacher_changes add column if not exists replacement_room text not null default '';
create index if not exists teacher_changes_lesson_date_idx on public.teacher_changes (lesson_date);