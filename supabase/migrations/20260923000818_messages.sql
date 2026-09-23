-- Wiadomości ucznia z administratorem oraz ogłoszenia administratora.
create table public.messages (
  id bigint generated always as identity primary key,
  sender_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  recipient_id uuid references auth.users(id) on delete cascade,
  sender_email text not null,
  subject text not null check (char_length(btrim(subject)) between 1 and 120),
  body text not null check (char_length(btrim(body)) between 1 and 2000),
  created_at timestamptz not null default now()
);

alter table public.messages enable row level security;

grant select, insert on table public.messages to authenticated;
grant usage, select on sequence public.messages_id_seq to authenticated;

-- Każdy użytkownik widzi własną korespondencję i ogłoszenia administracji.
create policy "read own messages and announcements"
on public.messages for select to authenticated
using (
  sender_id = (select auth.uid())
  or recipient_id = (select auth.uid())
  or (
    sender_id = '1f049736-fd58-4b4e-ac61-62af34e02651'::uuid
    and recipient_id is null
  )
);

-- Uczeń pisze tylko do administratora. Administrator może odpowiedzieć
-- uczniowi albo opublikować ogłoszenie dla wszystkich.
create policy "send messages to allowed recipients"
on public.messages for insert to authenticated
with check (
  sender_id = (select auth.uid())
  and lower(sender_email) = lower((select auth.jwt() ->> 'email'))
  and (
    (
      (select auth.uid()) = '1f049736-fd58-4b4e-ac61-62af34e02651'::uuid
      and (recipient_id is null or recipient_id <> (select auth.uid()))
    )
    or (
      (select auth.uid()) <> '1f049736-fd58-4b4e-ac61-62af34e02651'::uuid
      and recipient_id = '1f049736-fd58-4b4e-ac61-62af34e02651'::uuid
    )
  )
);

create index messages_sender_created_idx
on public.messages (sender_id, created_at desc);

create index messages_recipient_created_idx
on public.messages (recipient_id, created_at desc);

