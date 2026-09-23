-- Przechowujemy wynik auth.uid() jako InitPlan, aby polityka nie liczyła go dla każdego wiersza.
drop policy if exists "only admin sends teacher broadcasts" on public.messages;

create policy "only admin sends teacher broadcasts"
on public.messages for insert to authenticated
with check (
  sender_id = '1f049736-fd58-4b4e-ac61-62af34e02651'::uuid
  and (select auth.uid()) = '1f049736-fd58-4b4e-ac61-62af34e02651'::uuid
  and recipient_id is null
  and lower(sender_email) = lower(((select auth.jwt()) ->> 'email'))
  and char_length(btrim(sender_name)) between 1 and 120
);
