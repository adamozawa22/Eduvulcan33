# VULCAN

Niezależny projekt edukacyjny. Nie jest oficjalnym serwisem VULCAN.

## Strony

- `index.html`: publiczna strona powitalna.
- `aplikacja.html`, `uczen.html`, `rodzic.html`, `nauczyciel.html`, `baza-wiedzy.html`, `pomoc.html`: osobne strony menu publicznego.
- `logowanie.html`: logowanie kontem tego projektu.
- `start.html`, `wiadomosci.html`, `oceny.html`, `plan.html`, `frekwencja.html`, `uwagi.html`, `ustawienia.html`: osobne strony dziennika ucznia, dostępne po zalogowaniu.

Nawigacja używa zwykłych linków do plików HTML — działa na hostingu statycznym bez reguł przepisywania adresów. Wspólny kod dziennika znajduje się w `diary.js` i `diary.css`; strona publiczna korzysta z `public.css` i `public.js`. Formularz korzysta z istniejącego projektu Supabase i konfiguracji w `session.js`. Autoryzację dostępu do danych egzekwują reguły RLS bazy; przekierowanie w przeglądarce odpowiada jedynie za interfejs.

Wejście na podstronę bez sesji prowadzi do logowania z parametrem `next`. Dopuszczalne cele powrotu ograniczono do siedmiu stron dziennika. Powrót z pamięci przeglądarki ponownie sprawdza sesję.

Panele nauczyciela i administratora oraz migracje bazy pozostają osobnymi częściami projektu.

## Uruchomienie i testy

Uruchom dowolny serwer plików statycznych, np. `python -m http.server 8765`, i otwórz `http://localhost:8765`.

Testy bez dodatkowych zależności (Node.js 18+):

```sh
node --test tests/navigation.test.cjs
```

Testy sprawdzają linki, oddzielne widoki, przekierowania, renderowanie danych i obsługę błędu wylogowania z atrapą usługi. Test rzeczywistego logowania wymaga konta testowego w istniejącym projekcie Supabase.
