-- Tylko konto administratora publikuje wiadomości jako nauczyciel.
-- Uczeń i rodzic otrzymują komunikaty wyłącznie do odczytu.
alter table public.messages
  add column if not exists sender_name text not null default ''
    check (char_length(btrim(sender_name)) <= 120);

alter table public.messages enable row level security;

grant select, insert, delete on table public.messages to authenticated;

drop policy if exists "send messages to allowed recipients" on public.messages;
drop policy if exists "only admin sends teacher broadcasts" on public.messages;
drop policy if exists "administrators can delete messages" on public.messages;

create policy "only admin sends teacher broadcasts"
on public.messages for insert to authenticated
with check (
  sender_id = (select auth.uid())
  and (select auth.uid()) = '1f049736-fd58-4b4e-ac61-62af34e02651'::uuid
  and recipient_id is null
  and lower(sender_email) = lower((select auth.jwt() ->> 'email'))
  and char_length(btrim(sender_name)) between 1 and 120
);

create policy "administrators can delete messages"
on public.messages for delete to authenticated
using (
  (select auth.uid()) = '1f049736-fd58-4b4e-ac61-62af34e02651'::uuid
);
