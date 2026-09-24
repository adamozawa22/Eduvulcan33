-- Zasilenie skrzynki przykładowymi ogłoszeniami nauczycieli.
-- Warunki NOT EXISTS pozwalają bezpiecznie uruchomić migrację ponownie.
insert into public.messages
  (sender_id, recipient_id, sender_email, sender_name, subject, body, created_at)
select '1f049736-fd58-4b4e-ac61-62af34e02651', null, 'admin@szkola.pl', 'Krupińska-Pietrzak Agnieszka', 'Podziękowania',
$$Szanowni Rodzice, Drodzy Uczniowie.
Składam serdeczne podziękowania wszystkim Rodzicom za włączenie się w tegoroczne obchody Dni Ząbek oraz przygotowanie wspaniałych domowych wypieków i stanowisk.
Szczególne podziękowania i słowa uznania kieruję do obu naszych Rad Rodziców – Szkoły Podstawowej nr 5 oraz Liceum Ogólnokształcącego nr I – za ogromne zaangażowanie, nieocenione wsparcie organizacyjne i wspaniałą współpracę przy tym wydarzeniu.
Gorąco dziękuję również naszym uczniom i licealistom, którzy swoją obecnością, energią i dojrzałą postawą aktywnie włączyli się w obchody i z dumą reprezentowali naszą społeczność szkolną.
Z serca dziękuję!

Z poważaniem,
Agnieszka Krupińska-Pietrzak$$, '2026-09-13 12:12:00+02'
where not exists (select 1 from public.messages where sender_name='Krupińska-Pietrzak Agnieszka' and subject='Podziękowania' and created_at='2026-09-13 12:12:00+02');

insert into public.messages
  (sender_id, recipient_id, sender_email, sender_name, subject, body, created_at)
select '1f049736-fd58-4b4e-ac61-62af34e02651', null, 'admin@szkola.pl', 'Guerin Stephane', 'wycieczka do Paryża',
$$Dzień dobry.

Szanowni Państwo,

Chciałbym zorganizować w maju 2027 r. wycieczkę do Paryża dla klas 8 oraz liceum. Wycieczkę planuję po egzaminie 8-klasisty w dniach 17-20 maja. Musimy zebrać grupę minimum 46 uczniów, wówczas koszt wycieczki byłby następujący: 1490 zł + ok. 200 zł bilety wstępu + ok. 250 zł za całodzienny bilet do Disneylandu. Poniżej zamieszczam link do wycieczki, proszę o zapoznanie się i najpóźniej do piątku 18 września zdeklarować chęć uczestnictwa w wycieczce. Deklaracje proszę przesyłać do mnie przez Vulcan.

Pozdrawiam serdecznie - Stephane Guerin - n-l języka francuskiego.

LINK do wycieczki:
https://wycieczkownia.pl/tours/paryz-express-disneyland-nowosc/#program-wycieczki-pdf$$, '2026-09-15 18:12:00+02'
where not exists (select 1 from public.messages where sender_name='Guerin Stephane' and subject='wycieczka do Paryża' and created_at='2026-09-15 18:12:00+02');

insert into public.messages
  (sender_id, recipient_id, sender_email, sender_name, subject, body, created_at)
select '1f049736-fd58-4b4e-ac61-62af34e02651', null, 'admin@szkola.pl', 'Biesiada Sara', 'warsztaty',
$$Przypominamy, że już w tą niedzielę, 20 września o godzinie 16:00 w naszej szkole odbędą się warsztaty dla dorosłych pod honorowym patronatem Burmistrz Miasta Ząbki Małgorzaty Zyś - "Bezpiecznie i pewnie w Ząbkach".
Warsztaty są bezpłatne dla mieszkańców miasta Ząbki po wcześniejszym zgłoszeniu.
Zapraszam do zapisów pod numerem 662 056 026!$$, '2026-09-18 13:15:00+02'
where not exists (select 1 from public.messages where sender_name='Biesiada Sara' and subject='warsztaty' and created_at='2026-09-18 13:15:00+02');

insert into public.messages
  (sender_id, recipient_id, sender_email, sender_name, subject, body, created_at)
select '1f049736-fd58-4b4e-ac61-62af34e02651', null, 'admin@szkola.pl', 'Witosławska Małgorzata', 'Kółko chemiczne',
$$Dzień dobry

Serdecznie zapraszam chętnych uczniów na kółko chemiczne.

Wtorek 13:45-14:30 s.56

Zaczynamy 29.09.2026r

Pozdrawiam :)$$, '2026-09-22 14:24:00+02'
where not exists (select 1 from public.messages where sender_name='Witosławska Małgorzata' and subject='Kółko chemiczne' and created_at='2026-09-22 14:24:00+02');
