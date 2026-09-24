const menuButton=document.querySelector(".menu-button");
const menu=document.getElementById("public-menu");
if(menuButton && menu){
  menuButton.hidden=false;
  menu.classList.add("enhanced");
  menuButton.addEventListener("click",()=>{
    const open=menuButton.getAttribute("aria-expanded")!=="true";
    menuButton.setAttribute("aria-expanded",String(open));
    menu.classList.toggle("open",open);
    menuButton.textContent=open?"Zamknij ×":"Menu ☰";
  });
  document.addEventListener("keydown",event=>{
    if(event.key==="Escape" && menu.classList.contains("open")){
      menu.classList.remove("open");menuButton.setAttribute("aria-expanded","false");
      menuButton.textContent="Menu ☰";menuButton.focus();
    }
  });
}