const {test}=require("node:test");
const assert=require("node:assert/strict");
const fs=require("node:fs");
const path=require("node:path");
const vm=require("node:vm");
const root=path.join(__dirname,"..");
const read=name=>fs.readFileSync(path.join(root,name),"utf8");
const pages=["start","wiadomosci","oceny","plan","frekwencja","uwagi","ustawienia"];
function setup(page,session={user:{id:"test"}},search=""){
  const html=read(page+".html");
  const elements=new Map([...html.matchAll(/\bid="([^"]+)"/g)].map(m=>[m[1],{
    innerHTML:"",textContent:"",hidden:m[1]==="diary-app",value:"",
    classList:{add(){},remove(){},toggle(){}},setAttribute(){},addEventListener(){}
  }]));
  const redirects=[];
  const context=vm.createContext({
    document:{body:{dataset:{page}},getElementById:id=>elements.get(id)||null,
      querySelector:()=>null,querySelectorAll:()=>[]},
    location:{search,replace:url=>redirects.push(url),assign:url=>redirects.push(url)},
    window:{matchMedia:()=>({matches:true}),addEventListener(){}},URLSearchParams,Date,console,
    sb:{auth:{getSession:async()=>({data:{session}}),onAuthStateChange(){}},
      from:()=>({select:()=>({order:()=>({order:async()=>({data:[]}),then:r=>Promise.resolve({data:[]}).then(r),limit:async()=>({data:[]})})})})},
    localStorage:{getItem:()=>null},performance:{now:()=>0},requestAnimationFrame(){}
  });
  vm.runInContext(read("session.js").slice(read("session.js").indexOf("const DIARY_PAGES")),context);
  vm.runInContext(read("diary.js").replace(/\binitAuth\(\);\s*$/,""),context);
  return {context,elements,redirects};
}
test("every public navigation link resolves to a local file",()=>{
  for(const file of fs.readdirSync(root).filter(x=>x.endsWith(".html"))){
    for(const m of read(file).matchAll(/\b(?:href|src)="([^"]+)"/g)){
      if(/^(https?:|#|mailto:)/.test(m[1]))continue;
      const target=m[1].split(/[?#]/)[0];
      assert.ok(fs.existsSync(path.join(root,target)),file+" → "+target);
    }
  }
});
test("each diary document contains only its own view and real links",()=>{
  for(const page of pages){
    const html=read(page+".html");
    assert.deepEqual([...html.matchAll(/id="view-([^"]+)"/g)].map(m=>m[1]),[page]);
    assert.equal([...html.matchAll(/data-view="/g)].length,7);
    assert.ok(html.includes('aria-current="page" data-view="'+page+'"'));
    assert.ok(html.includes('id="diary-app" hidden'));
  }
});
test("every diary page renders with an existing session",async()=>{
  for(const page of pages){
    const {context,elements,redirects}=setup(page);
    await vm.runInContext("initAuth()",context);
    assert.deepEqual(redirects,[]);
    assert.equal(elements.get("diary-app").hidden,false);
    assert.equal(elements.get("session-status").hidden,true);
    assert.equal(elements.get("session-status").innerHTML,"",page+" render failed");
  }
});
test("unauthenticated deep links return to the requested section",async()=>{
  for(const page of pages){
    const {context,redirects,elements}=setup(page,null);
    await vm.runInContext("initAuth()",context);
    assert.deepEqual(redirects,["logowanie.html?next="+page]);
    assert.equal(elements.get("diary-app").hidden,true);
  }
});
test("return destinations cannot redirect outside the diary",()=>{
  const {context}=setup("start");
  for(const input of ["https://example.com","//example.com","../admin.html","admin.html","constructor","__proto__"]){
    context.input=input;
    assert.equal(vm.runInContext("diaryDestination(input)",context),"start.html");
  }
  assert.equal(vm.runInContext('diaryDestination("oceny")',context),"oceny.html");
});
test("date links, grades and remarks render on their own pages",()=>{
  const plan=setup("frekwencja",{user:{id:"test"}},"?date=2026-09-24");
  assert.equal(vm.runInContext("formatISODate(currentDate)",plan.context),"2026-09-24");
  vm.runInContext('openDay("2026-09-25")',plan.context);
  assert.deepEqual(plan.redirects,["frekwencja.html?date=2026-09-25"]);
  const grades=setup("oceny");
  vm.runInContext('gradesData=[{subject:"Matematyka",value:"5",weight:2,grade_date:"2026-09-24"}];renderAll()',grades.context);
  assert.match(grades.elements.get("oceny-content").innerHTML,/Matematyka/);
  const remarks=setup("uwagi");
  vm.runInContext('remarksData=[{title:"Dobra praca",kind:"praise",entry_date:"2026-09-24"}];renderAll()',remarks.context);
  assert.match(remarks.elements.get("remarks-content").innerHTML,/Dobra praca/);
});
test("logout failure keeps the page and displays a retry message",async()=>{
  const {context,elements,redirects}=setup("ustawienia");
  vm.runInContext('sb.auth.signOut=async()=>({error:new Error("offline")})',context);
  await vm.runInContext("logoutDiary()",context);
  assert.deepEqual(redirects,[]);
  assert.match(elements.get("data-notice").textContent,/Nie udało się wylogować/);
});

