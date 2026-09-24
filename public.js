const menuButton=document.querySelector(".menu-button");
const menu=document.getElementById("public-menu");
if(menuButton && menu){
  menuButton.hidden=false;
  menu.classList.add("enhanced");

  const closeMenu=(restoreFocus=false)=>{
    menu.classList.remove("open");
    menuButton.setAttribute("aria-expanded","false");
    menuButton.textContent="Menu ☰";
    if(restoreFocus)menuButton.focus();
  };

  menuButton.addEventListener("click",event=>{
    event.stopPropagation();
    const open=menuButton.getAttribute("aria-expanded")!=="true";
    menuButton.setAttribute("aria-expanded",String(open));
    menu.classList.toggle("open",open);
    menuButton.textContent=open?"Zamknij ×":"Menu ☰";
  });

  menu.querySelectorAll("a").forEach(link=>link.addEventListener("click",()=>closeMenu()));
  document.addEventListener("click",event=>{
    if(menu.classList.contains("open")&&!menu.contains(event.target)&&event.target!==menuButton)closeMenu();
  });
  document.addEventListener("keydown",event=>{
    if(event.key==="Escape"&&menu.classList.contains("open"))closeMenu(true);
  });
  window.addEventListener("resize",()=>{
    if(window.innerWidth>760&&menu.classList.contains("open"))closeMenu();
  });
}
