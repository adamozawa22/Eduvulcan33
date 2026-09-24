const destination=diaryDestination(new URLSearchParams(location.search).get("next"));
const form=document.getElementById("login-form");
const errorBox=document.getElementById("login-error");
const submit=document.getElementById("login-submit");
form.addEventListener("submit",async(event)=>{
  event.preventDefault();
  errorBox.textContent="";
  submit.disabled=true;
  submit.textContent="Logowanie…";
  try{
    if(!sb)throw new Error("Usługa logowania jest chwilowo niedostępna.");
    const {data,error}=await sb.auth.signInWithPassword({
      email:document.getElementById("login-email").value.trim(),
      password:document.getElementById("login-password").value
    });
    if(error){
      if(error.status===400 || error.code==="invalid_credentials"){
        errorBox.textContent="Nieprawidłowy e-mail lub hasło.";return;
      }
      throw error;
    }
    if(!data.session)throw new Error("Brak sesji");
    document.getElementById("login-password").value="";
    location.replace(destination);
  }catch(error){
    errorBox.textContent="Nie udało się połączyć z usługą logowania. Spróbuj ponownie.";
  }finally{submit.disabled=false;submit.textContent="Zaloguj się →";}
});
(async()=>{
  if(!sb){errorBox.textContent="Usługa logowania jest chwilowo niedostępna.";return;}
  try{
    const {data,error}=await sb.auth.getSession();
    if(error)throw error;
    if(data.session)location.replace(destination);
  }catch(error){errorBox.textContent="Nie udało się sprawdzić sesji. Spróbuj zalogować się ponownie.";}
})();