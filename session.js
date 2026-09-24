const SUPABASE_URL="https://hozpikyxilmedzsyquct.supabase.co";

const SUPABASE_ANON_KEY="sb_publishable_OMnC90EdPVnLwJXAx8jipA_rV0lZfdD";

const sb=
  (window.supabase && window.supabase.createClient)
    ? window.supabase.createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
      )
    : null;


const DIARY_PAGES = ["start","wiadomosci","oceny","plan","frekwencja","uwagi","ustawienia"];
function diaryDestination(value) {
  const name=String(value||"").replace(/\.html$/, "");
  return DIARY_PAGES.includes(name) ? name+".html" : "start.html";
}
