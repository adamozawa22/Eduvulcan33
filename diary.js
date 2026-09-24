const activePage=document.body.dataset.page;
function showLogin(){
  document.getElementById("diary-app").hidden=true;
  location.replace("logowanie.html?next="+encodeURIComponent(activePage));
}
async function logoutDiary(){
  try {
    const {error}=await sb.auth.signOut();
    if(error)throw error;
    location.replace("index.html");
  } catch(error){showNotice("Nie udało się wylogować. Spróbuj ponownie.");}
}
async function initAuth(){
  const status=document.getElementById("session-status");
  try{
    if(!sb)throw new Error("Usługa niedostępna");
    const {data,error}=await sb.auth.getSession();
    if(error)throw error;
    if(!data.session){showLogin();return;}
    status.hidden=true;
    document.getElementById("diary-app").hidden=false;
    sb.auth.onAuthStateChange((event,session)=>{
      if(event==="SIGNED_OUT" || (event==="TOKEN_REFRESHED" && !session))showLogin();
    });
    renderAll();
    await loadSupabaseData();
    if(activePage==="wiadomosci")await loadMessages();
  }catch(error){
    status.innerHTML='Nie udało się sprawdzić sesji. <a href="logowanie.html">Przejdź do logowania</a>';
  }
}
let lessonPlanData=[];
let attendanceData=[];
let teacherChangesData=[];
let gradesData=[];
let remarksData=[];
let messagesData=[];

function formatMessageDate(value){
  const date=new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleString("pl-PL",{day:"2-digit",month:"2-digit",year:"numeric",hour:"2-digit",minute:"2-digit"});
}

function renderMessages(){
  const list=document.getElementById("student-message-list");
  list.innerHTML=messagesData.length
    ? messagesData.map(message=>{
        const senderName=String(message.sender_name||"Nauczyciel").trim()||"Nauczyciel";
        return `<article class="message-card">
          <div class="message-meta"><span>Od nauczyciela: ${escapeHTML(senderName)}</span><time>${escapeHTML(formatMessageDate(message.created_at))}</time></div>
          <h3>${escapeHTML(message.subject)}</h3>
          <p class="message-body">${escapeHTML(message.body)}</p>
        </article>`;
      }).join("")
    : '<div class="message-empty">Nie ma jeszcze wiadomości.</div>';
}

async function loadMessages(){
  const list=document.getElementById("student-message-list");
  if(!sb){
    list.innerHTML='<div class="message-empty">Usługa wiadomości jest niedostępna.</div>';
    return;
  }
  list.innerHTML='<div class="message-empty">Wczytywanie wiadomości…</div>';
  try{
    const {data,error}=await sb.from("messages")
      .select("id,sender_id,recipient_id,sender_name,subject,body,created_at")
      .order("created_at",{ascending:false})
      .limit(100);
    if(error)throw error;
    messagesData=data||[];
    renderMessages();
  }catch(error){
    list.innerHTML='<div class="message-empty">Nie udało się wczytać wiadomości. Spróbuj ponownie.</div>';
  }
}


function showNotice(text){

  const box=
    document.getElementById("data-notice");

  if(!box)return;

  if(!text){
    box.classList.remove("show");
    box.textContent="";
    return;
  }

  box.textContent=text;
  box.classList.add("show");

}


/* =====================================================
   PLAN ZAPASOWY
===================================================== */

const weeklyPlan={

1:[
{n:1,start:"08:00",end:"08:45",subj:"Język polski",room:"74",teacher:"Joanna Ołdak"},
{n:2,start:"08:50",end:"09:35",subj:"Język polski",room:"74",teacher:"Joanna Ołdak"},
{n:3,start:"09:45",end:"10:30",subj:"Chemia",room:"56",teacher:"Małgorzata Witosławska"},
{n:4,start:"10:40",end:"11:25",subj:"Matematyka",room:"75",teacher:"Małgorzata Jankowska"},
{n:5,start:"11:45",end:"12:30",subj:"Matematyka",room:"75",teacher:"Małgorzata Jankowska"},
{n:6,start:"12:50",end:"13:35",subj:"Zajęcia z wychowawcą",room:"wych",teacher:"Małgorzata Jankowska"},
{n:7,start:"13:45",end:"14:30",subj:"Wychowanie fizyczne",room:"sg2",teacher:"Agnieszka Hojniak"}
],

2:[
{n:1,start:"08:00",end:"08:45",subj:"Wiedza o społeczeństwie",room:"65",teacher:"Marta Kwiatkowska"},
{n:2,start:"08:50",end:"09:35",subj:"Fizyka",room:"74",teacher:"Edyta Gaworek"},
{n:3,start:"09:45",end:"10:30",subj:"Język angielski",room:"57",teacher:"Agata Lewandowska"},
{n:4,start:"10:40",end:"11:25",subj:"Matematyka",room:"75",teacher:"Małgorzata Jankowska"},
{n:5,start:"11:45",end:"12:30",subj:"Informatyka",room:"52",teacher:"Piotr Antoniuk"},
{n:6,start:"12:50",end:"13:35",subj:"Historia",room:"61",teacher:"Marta Kwiatkowska"},
{n:7,start:"13:45",end:"14:30",subj:"Edukacja dla bezpieczeństwa",room:"20",teacher:"Anna Kula"}
],

3:[
{n:1,start:"08:00",end:"08:45",subj:"Język niemiecki",room:"gs",teacher:"Marta Kamińska"},
{n:2,start:"08:50",end:"09:35",subj:"Język niemiecki",room:"gs",teacher:"Marta Kamińska"},
{n:3,start:"09:45",end:"10:30",subj:"Wychowanie fizyczne",room:"sg1",teacher:"Agnieszka Hojniak"},
{n:4,start:"10:40",end:"11:25",subj:"MAK",room:"68",teacher:"Małgorzata Jankowska"},
{n:5,start:"11:45",end:"12:30",subj:"Matematyka",room:"61",teacher:"Małgorzata Jankowska"},
{n:6,start:"12:50",end:"13:35",subj:"POK",room:"20",teacher:"Joanna Ołdak"},
{n:7,start:"13:45",end:"14:30",subj:"Chemia",room:"56",teacher:"Małgorzata Witosławska"}
],

4:[
{n:2,start:"08:50",end:"09:35",subj:"Wychowanie fizyczne",room:"sg2",teacher:"Agnieszka Hojniak"},
{n:3,start:"09:45",end:"10:30",subj:"Język angielski",room:"57",teacher:"Agata Lewandowska"},
{n:4,start:"10:40",end:"11:25",subj:"Język angielski",room:"57",teacher:"Agata Lewandowska"},
{n:5,start:"11:45",end:"12:30",subj:"Język polski",room:"61",teacher:"Joanna Ołdak"},
{n:6,start:"12:50",end:"13:35",subj:"Historia",room:"65",teacher:"Marta Kwiatkowska"}
],

5:[
{n:1,start:"08:00",end:"08:45",subj:"Geografia",room:"65",teacher:"Joanna Sosińska"},
{n:2,start:"08:50",end:"09:35",subj:"Wychowanie fizyczne",room:"sg1",teacher:"Agnieszka Hojniak"},
{n:3,start:"09:45",end:"10:30",subj:"Fizyka",room:"74",teacher:"Edyta Gaworek"},
{n:4,start:"10:40",end:"11:25",subj:"Język polski",room:"68",teacher:"Joanna Ołdak"},
{n:5,start:"11:45",end:"12:30",subj:"Język polski",room:"68",teacher:"Joanna Ołdak"},
{n:6,start:"12:50",end:"13:35",subj:"Biologia",room:"61",teacher:"Justyna Kubiak"},
{n:7,start:"13:45",end:"14:30",subj:"Wiedza o społeczeństwie",room:"61",teacher:"Marta Kwiatkowska"},
{n:8,start:"14:35",end:"15:20",subj:"Edukacja zdrowotna",room:"66",teacher:"Agnieszka Hojniak"}
]

};


/* =====================================================
   DATA
===================================================== */

let currentDate=new Date();
currentDate.setHours(0,0,0,0);
const requestedDate=new URLSearchParams(location.search).get("date");
if(requestedDate && /^\d{4}-\d{2}-\d{2}$/.test(requestedDate)){
  const parsed=parseISODate(requestedDate);
  if(parsed && formatISODate(parsed)===requestedDate)currentDate=parsed;
}

const dayNames=[
"Niedziela",
"Poniedziałek",
"Wtorek",
"Środa",
"Czwartek",
"Piątek",
"Sobota"
];

const monthNames=[
"Stycznia",
"Lutego",
"Marca",
"Kwietnia",
"Maja",
"Czerwca",
"Lipca",
"Sierpnia",
"Września",
"Października",
"Listopada",
"Grudnia"
];

const dayShort=["Nd","Pn","Wt","Śr","Cz","Pt","Sb"];

const monthShort=[
"sty","lut","mar","kwi","maj","cze",
"lip","sie","wrz","paź","lis","gru"
];


/* =====================================================
   DATA -> YYYY-MM-DD
===================================================== */

function formatISODate(date){

  const y=date.getFullYear();
  const m=String(date.getMonth()+1).padStart(2,"0");
  const d=String(date.getDate()).padStart(2,"0");

  return `${y}-${m}-${d}`;

}


/* =====================================================
   YYYY-MM-DD -> DATA (czas lokalny)
===================================================== */

function parseISODate(value){

  const m=/^(\d{4})-(\d{2})-(\d{2})/.exec(String(value||""));

  if(!m)return null;

  return new Date(
    Number(m[1]),
    Number(m[2])-1,
    Number(m[3])
  );

}


/* =====================================================
   DATA -> DZIEŃ ADMINA
===================================================== */

function adminWeekdayFromDate(date){

  const jsDay=date.getDay();

  if(jsDay>=1 && jsDay<=5){
    return jsDay-1;
  }

  return -1;

}


/* =====================================================
   FORMAT DATY
===================================================== */

function formatDate(date){

  return (
    dayNames[date.getDay()]
    +" · "+
    date.getDate()
    +" "+
    monthNames[date.getMonth()]
    +" "+
    date.getFullYear()
  );

}


/* =====================================================
   LEKCJE Z SUPABASE
===================================================== */

function getLessonsFromSupabase(date){

  const weekday=adminWeekdayFromDate(date);

  if(weekday<0)return [];

  const dateISO=formatISODate(date);

  return lessonPlanData
    .filter(x=>Number(x.weekday)===weekday)
    .sort((a,b)=>Number(a.lesson_number)-Number(b.lesson_number))
    .map(x=>{

      const change=
        teacherChangesData.find(c=>
          String(c.lesson_plan_id)===String(x.id) &&
          String(c.lesson_date||"")===dateISO
        );

      return {

        n:Number(x.lesson_number),

        start:String(x.start_time||"").slice(0,5),

        end:String(x.end_time||"").slice(0,5),

        subj:x.subject||"",

        room:x.room||"",

        teacher:x.teacher||"",

        absent:!!(change && change.teacher_absent),


      };

    });

}


/* =====================================================
   LEKCJE
===================================================== */

function getLessons(date){

  if(lessonPlanData.length){

    return getLessonsFromSupabase(date);

  }

  return (weeklyPlan[date.getDay()]||[])
    .map(l=>({...l,absent:false}));

}


/* =====================================================
   OPIS NAUCZYCIELA
===================================================== */

function teacherLine(l){
  return '<span class="teacher-name">'+escapeHTML(l.teacher)+'</span>'+(l.absent
    ? ' <span class="teacher-absent">Nauczyciel nieobecny</span>'
    : "");
}


/* =====================================================
   POBIERANIE DANYCH
===================================================== */

async function loadSupabaseData(){

  if(!sb){

    showNotice(
      "Nie udało się połączyć z bazą danych. Widzisz stały plan lekcji, bez frekwencji."
    );

    renderAll();

    return;

  }

  try{

    const lessons=
      await sb
        .from("lesson_plan")
        .select("*")
        .order("weekday")
        .order("lesson_number");

    if(lessons.error)throw lessons.error;

    lessonPlanData=lessons.data||[];


    const attendance=
      await sb
        .from("attendance")
        .select("*")
        .order("lesson_date")
        .order("lesson_number");

    if(attendance.error)throw attendance.error;

    attendanceData=attendance.data||[];


    const changes=
      await sb
        .from("teacher_changes")
        .select("*")
        .order("lesson_date");

    if(changes.error && changes.error.code!=="42P01"){

      throw changes.error;

    }

    teacherChangesData=changes.data||[];


    const grades=
      await sb
        .from("grades")
        .select("*")
        .order("grade_date",{ascending:false});

    if(grades.error && grades.error.code!=="42P01"){

      throw grades.error;

    }

    gradesData=grades.data||[];


    const remarks=
      await sb
        .from("remarks")
        .select("*")
        .order("entry_date",{ascending:false});

    if(remarks.error && remarks.error.code!=="42P01"){

      throw remarks.error;

    }

    remarksData=remarks.data||[];


    showNotice("");

    renderAll();

  }catch(error){

    console.error(
      "Błąd pobierania danych Supabase:",
      error
    );

    showNotice(
      "Nie udało się pobrać danych z dziennika. Widzisz stały plan lekcji. Szczegóły błędu są w konsoli."
    );

    renderAll();

  }

}


/* =====================================================
   STATUS FREKWENCJI
===================================================== */

function getAttendanceForLesson(date,lessonNumber){

  const dateISO=formatISODate(date);

  return attendanceData.find(x=>
    Number(x.lesson_number)===Number(lessonNumber) &&
    String(x.lesson_date||"")===dateISO
  )||null;

}


/* =====================================================
   IKONY
===================================================== */

function iconForStatus(status){

  if(status==="absent"){

    return `
    <svg viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="3">
      <path d="M6 6l12 12M18 6L6 18"/>
    </svg>`;

  }

  if(status==="late"){

    return `
    <svg viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="2.5">
      <circle cx="12" cy="12" r="9"/>
      <path d="M12 7v5l3 2"/>
    </svg>`;

  }

  if(status==="present"){

    return `
    <svg viewBox="0 0 24 24" fill="none"
      stroke="currentColor" stroke-width="3">
      <path d="M20 6L9 17l-5-5"/>
    </svg>`;

  }

  return `
  <svg viewBox="0 0 24 24" fill="none"
    stroke="currentColor" stroke-width="2">
    <circle cx="12" cy="12" r="9"/>
    <path d="M8 12h8"/>
  </svg>`;

}


/* =====================================================
   STATYSTYKI FREKWENCJI
===================================================== */

function calculateAttendance(){

  let present=0;
  let absent=0;
  let late=0;

  attendanceData.forEach(x=>{

    if(x.status==="present")present++;

    if(x.status==="absent")absent++;

    if(x.status==="late")late++;

  });

  const total=present+absent+late;

  const percent=
    total
      ? Math.round(((present+late)/total)*100)
      : null;

  return {
    present,
    absent,
    late,
    total,
    percent
  };

}


/* =====================================================
   START
===================================================== */

let startSummarySig="";

function animateAttendancePercent(){
  const value=document.querySelector(".attendance-value");
  if(!value)return;

  const target=Number(value.dataset.target);
  if(!Number.isFinite(target))return;

  if(window.matchMedia("(prefers-reduced-motion: reduce)").matches){
    value.innerHTML=target+"<small>%</small>";
    return;
  }

  const start=100;
  const duration=900;
  const started=performance.now();

  function frame(now){
    const progress=Math.min((now-started)/duration,1);
    const eased=1-Math.pow(1-progress,3);
    const current=Math.round(start+(target-start)*eased);
    value.innerHTML=current+"<small>%</small>";

    if(progress<1)requestAnimationFrame(frame);
  }

  requestAnimationFrame(frame);
}

function buildSummary(stats,days){

  const R=52;
  const C=2*Math.PI*R;

  const presentLen=stats.total
    ? (stats.present/stats.total)*C
    : 0;

  const overlays=[
    {
      v:stats.late,
      color:"var(--warn)",
      offset:presentLen
    },
    {
      v:stats.absent,
      color:"var(--danger)",
      offset:presentLen+(stats.total?(stats.late/stats.total)*C:0)
    }
  ].filter(p=>p.v>0);

  const gap=0;

  const successBase=stats.total
    ? `<circle class="ring-success-base" cx="70" cy="70" r="${R}" style="--circ:${C.toFixed(2)}" stroke-dasharray="${C.toFixed(2)} 0"/>`
    : "";

  const segments=
    stats.total
      ? overlays.map((p,index)=>{

          const len=(p.v/stats.total)*C;
          const draw=Math.max(len-gap,0.5);

          return `<circle class="ring-seg" cx="70" cy="70" r="${R}"`+
            ` style="stroke:${p.color};--circ:${C.toFixed(2)};--delay:${.52+index*.14}s"`+
            ` stroke-dasharray="${draw.toFixed(2)} ${(C-draw).toFixed(2)}"`+
            ` stroke-dashoffset="${(-p.offset).toFixed(2)}"/>`;

        }).join("")
      : "";

  const big=
    stats.percent===null
      ? `<b>—</b>`
      : `<b class="attendance-value" data-target="${stats.percent}">100<small>%</small></b>`;

  const caption=
    stats.percent===null
      ? "brak wpisów"
      : "frekwencja";

  const aria=
    stats.percent===null
      ? "Brak wpisów frekwencji"
      : "Frekwencja "+stats.percent+" procent";

  return `

    <div class="st-card sum">

      <div class="sum-main">

        <div class="ring-wrap">

          <svg class="ring" viewBox="0 0 140 140"
            role="img" aria-label="${aria}">
            <circle class="ring-track" cx="70" cy="70" r="${R}"/>
            ${successBase}
            ${segments}
          </svg>

          <div class="ring-center">
            ${big}
            <span>${caption}</span>
          </div>

        </div>

        <ul class="legend">

          <li>
            <i style="background:var(--ok)"></i>
            <span>Obecności</span>
            <b>${stats.present}</b>
          </li>

          <li>
            <i style="background:var(--warn)"></i>
            <span>Spóźnienia</span>
            <b>${stats.late}</b>
          </li>

          <li>
            <i style="background:var(--danger)"></i>
            <span>Nieobecności</span>
            <b>${stats.absent}</b>
          </li>

        </ul>

      </div>

      <div class="sum-foot">

        <div>
          <b>${stats.total}</b>
          <span>wpisane lekcje</span>
        </div>

        <div>
          <b>${days}</b>
          <span>dni z frekwencją</span>
        </div>

      </div>

    </div>

  `;

}


function getWeekDays(){

  const base=new Date();
  base.setHours(0,0,0,0);

  const dow=base.getDay();

  base.setDate(
    base.getDate()+(dow===0?-6:1-dow)
  );

  return [0,1,2,3,4].map(i=>{

    const d=new Date(base);
    d.setDate(base.getDate()+i);

    return d;

  });

}


function weekRangeLabel(days){

  const a=days[0];
  const b=days[4];

  const ma=monthNames[a.getMonth()].toLowerCase();
  const mb=monthNames[b.getMonth()].toLowerCase();

  if(a.getMonth()===b.getMonth()){

    return `${a.getDate()}–${b.getDate()} ${mb}`;

  }

  return `${a.getDate()} ${ma} – ${b.getDate()} ${mb}`;

}


function renderStart(){

  const stats=calculateAttendance();

  const byDate={};

  attendanceData.forEach(x=>{

    const key=String(x.lesson_date||"");

    if(!key)return;

    const s=
      byDate[key]||
      (byDate[key]={present:0,late:0,absent:0,total:0});

    if(x.status==="present"){s.present++;s.total++;}
    else if(x.status==="late"){s.late++;s.total++;}
    else if(x.status==="absent"){s.absent++;s.total++;}

  });

  const daysWithData=
    Object.values(byDate)
      .filter(s=>s.total>0)
      .length;


  /* --- podsumowanie --- */

  const sig=
    [stats.present,stats.late,stats.absent,daysWithData].join("|");

  if(sig!==startSummarySig){

    startSummarySig=sig;

    document.getElementById("start-summary")
      .innerHTML=buildSummary(stats,daysWithData);

    animateAttendancePercent();

  }


  /* --- ten tydzień --- */

  const week=getWeekDays();

  document.getElementById("start-week-range")
    .textContent=weekRangeLabel(week);

  const todayISO=formatISODate(new Date());

  const stateIcon={
    ok:"present",
    warn:"late",
    bad:"absent",
    none:"none"
  };

  const stateText={
    ok:"obecność",
    warn:"spóźnienie",
    bad:"nieobecność",
    none:"brak wpisów"
  };

  document.getElementById("start-week")
    .innerHTML=week.map(d=>{

      const iso=formatISODate(d);
      const s=byDate[iso];

      let state="none";

      if(s && s.total){

        if(s.absent)state="bad";
        else if(s.late)state="warn";
        else state="ok";

      }

      const detail=
        state==="none"
          ? "—"
          : (s.present+s.late)+"/"+s.total;

      const label=
        dayNames[d.getDay()]+" "+d.getDate()+": "+stateText[state];

      return `

        <button class="wd ${state} ${iso===todayISO?"today":""}"
          onclick="openDay('${iso}')"
          aria-label="${escapeHTML(label)}">

          <span class="wd-name">${dayShort[d.getDay()]}</span>

          <span class="wd-num">${d.getDate()}</span>

          <span class="wd-mark">${iconForStatus(stateIcon[state])}</span>

          <span class="wd-detail">${detail}</span>

        </button>

      `;

    }).join("");


  /* --- ostatnie oceny --- */

  const recentGrades = (gradesData || [])
    .slice()
    .sort((a, b) =>
      String(b.grade_date || "").localeCompare(String(a.grade_date || ""))
    )
    .slice(0, 4);

  const startGradesBox = document.getElementById("start-grades");
  if (startGradesBox) {
    startGradesBox.innerHTML = recentGrades.length
      ? `<div class="st-card issues">` +
        recentGrades
          .map(g => {
            const d = parseISODate(g.grade_date);
            const dayNum = d ? d.getDate() : "—";
            const monthStr = d ? monthShort[d.getMonth()] : "";

            return `

              <div class="issue">

                <div class="issue-date">
                  <b>${dayNum}</b>
                  <span>${monthStr}</span>
                </div>

                <div class="issue-body">
                  <b>${escapeHTML(g.subject)}</b>
                  <span>${escapeHTML(g.category || "Ocena")}${g.description ? " · " + escapeHTML(g.description) : ""}</span>
                </div>

                <div class="status-pill present" style="font-size:16px;font-weight:800;padding:6px 14px">
                  ${escapeHTML(g.value)}
                </div>

              </div>

            `;
          })
          .join("") +
        `</div>`
      : `<div class="st-card"><div class="st-empty">Brak ostatnich ocen.</div></div>`;
  }



}


/* kliknięcie dnia w tygodniu -> frekwencja z tego dnia */

function openDay(iso){

  const d=parseISODate(iso);

  if(!d)return;

  currentDate=d;

  renderAll();

  showView("frekwencja");

}


/* =====================================================
   PLAN
===================================================== */

function renderPlan(){

  const lessons=getLessons(currentDate);

  document.getElementById("plan-day-label")
    .textContent=formatDate(currentDate);

  const list=document.getElementById("plan-list");


  if(!lessons.length){

    list.innerHTML=`

      <div class="empty-state">

        <div class="ico"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="icons.svg#calendar-empty"/></svg></div>

        <div>
          Brak lekcji tego dnia
        </div>

      </div>

    `;

    return;

  }


  list.innerHTML=lessons.map(l=>`

    <div class="lesson-card ${l.absent?"cancelled":""}">

      <div class="lesson-num">
        ${l.n}
      </div>

      <div class="lesson-time">
        ${escapeHTML(l.start)}<br>
        ${escapeHTML(l.end)}
      </div>

      <div class="lesson-body">

        <div class="subj">
          ${escapeHTML(l.subj)}
        </div>

        <div class="meta">
          <span class="lesson-room">Sala ${escapeHTML(l.room)}</span>
          ·
          ${teacherLine(l)}
        </div>


      </div>

    </div>

  `).join("");

}


/* =====================================================
   FREKWENCJA
===================================================== */

function renderAttendance(){

  const lessons=getLessons(currentDate);

  const stats=calculateAttendance();


  document.getElementById("att-day-label")
    .textContent=formatDate(currentDate);


  document.getElementById("att-percent")
    .textContent=
      stats.percent===null
        ? "—"
        : stats.percent+"%";


  document.getElementById("att-total")
    .textContent=stats.total;


  document.getElementById("att-present")
    .textContent=stats.present;


  document.getElementById("att-absent")
    .textContent=stats.absent;


  document.getElementById("stat-percent")
    .textContent=
      stats.percent===null
        ? "—"
        : stats.percent+"%";


  document.getElementById("stat-lessons")
    .textContent=stats.total;


  document.getElementById("stat-absent")
    .textContent=stats.absent;


  const dates=[
    ...new Set(
      attendanceData
        .map(x=>x.lesson_date)
        .filter(Boolean)
    )
  ];

  document.getElementById("stat-days")
    .textContent=dates.length;


  const list=document.getElementById("att-list");


  if(!lessons.length){

    list.innerHTML=`

      <div class="empty-state">

        <div class="ico"><svg viewBox="0 0 24 24" aria-hidden="true"><use href="icons.svg#calendar-empty"/></svg></div>

        <div>
          Brak lekcji tego dnia
        </div>

      </div>

    `;

    return;

  }


  list.innerHTML=lessons.map(l=>{

    const record=
      getAttendanceForLesson(
        currentDate,
        l.n
      );


    const status=record?.status||"none";


    let label="Brak wpisu";

    if(status==="present")
      label="Obecność";

    if(status==="absent")
      label="Nieobecność";

    if(status==="late")
      label="Spóźnienie";


    return `

      <div class="att-lesson ${l.absent?"cancelled":""}">

        <div class="lesson-num">
          ${l.n}
        </div>

        <div class="lesson-time">
          ${escapeHTML(l.start)}<br>
          ${escapeHTML(l.end)}
        </div>

        <div class="lesson-body">

          <div class="subj">
            ${escapeHTML(l.subj)}
          </div>

          <div class="meta">
            <span class="lesson-room">Sala ${escapeHTML(l.room)}</span>
            ·
            ${teacherLine(l)}
          </div>

        </div>

        <div class="status-pill ${status}">

          ${iconForStatus(status)}

          ${label}

        </div>

      </div>

    `;

  }).join("");

}


/* =====================================================
   OCENY
===================================================== */

function gradeToNumber(v){

  const s=String(v||"").trim();
  const base=parseFloat(s);

  if(Number.isNaN(base))return null;

  if(s.endsWith("+"))return base+0.5;
  if(s.endsWith("-"))return base-0.25;

  return base;

}


function fmtShortGradeDate(d){

  const date=parseISODate(d);

  if(!date)return "";

  return String(date.getDate()).padStart(2,"0")+
    "."+
    String(date.getMonth()+1).padStart(2,"0");

}


function gradeTone(value){
  const n=gradeToNumber(value);
  if(n===null)return "neutral";
  if(n>=4.5)return "good";
  if(n>=3)return "mid";
  return "bad";
}


function renderOceny(){
  const box=document.getElementById("oceny-content");
  if(!box)return;
  if(!gradesData.length){
    box.innerHTML='<div class="empty-state">Brak ocen do wyświetlenia.</div>';
    return;
  }
  const bySubject=new Map();
  gradesData.forEach(g=>{
    const subject=g.subject||"Inne";
    if(!bySubject.has(subject))bySubject.set(subject,[]);
    bySubject.get(subject).push(g);
  });
  let overallSum=0,overallWeight=0;
  const blocks=[...bySubject.keys()].sort((a,b)=>a.localeCompare(b,"pl")).map(subject=>{
    const rows=bySubject.get(subject).slice().sort((a,b)=>
      String(b.grade_date||"").localeCompare(String(a.grade_date||"")));
    let sum=0,weight=0;
    rows.forEach(row=>{
      const value=gradeToNumber(row.value),w=Number(row.weight)||1;
      if(value!==null){sum+=value*w;weight+=w;}
    });
    overallSum+=sum;
    overallWeight+=weight;
    const average=weight?(sum/weight).toFixed(2).replace(".",","):"—";
    return `
      <details class="grade-subject">
        <summary>
          <span class="grade-subject-name">${escapeHTML(subject)}</span>
          <span class="grade-marks">${rows.map(row=>`<span class="grade-mark ${gradeTone(row.value)}">${escapeHTML(row.value)}</span>`).join("")}</span>
          <span class="grade-average" aria-label="Średnia ważona ${average}">${average}</span>
        </summary>
        <div class="grade-details">
          <table aria-label="Szczegóły ocen: ${escapeHTML(subject)}">
            <thead><tr><th scope="col">Ocena</th><th scope="col">Kategoria i opis</th><th scope="col">Data</th><th scope="col">Waga</th></tr></thead>
            <tbody>${rows.map(row=>`<tr>
              <td>${escapeHTML(row.value)}</td>
              <td>${escapeHTML(row.category||"Ocena")}${row.description?`<span class="grade-description">${escapeHTML(row.description)}</span>`:""}</td>
              <td>${escapeHTML(fmtShortGradeDate(row.grade_date)||"—")}</td>
              <td>${escapeHTML(String(Number(row.weight)||1))}</td>
            </tr>`).join("")}</tbody>
          </table>
        </div>
      </details>`;
  }).join("");
  const average=overallWeight?(overallSum/overallWeight).toFixed(2).replace(".",","):"—";
  box.innerHTML=`
    <div class="grades-overview"><span>Liczba ocen: <b>${gradesData.length}</b></span><span>Średnia ważona wszystkich ocen: <b>${average}</b></span></div>
    <div class="grades-ledger">
      <div class="grades-columns" aria-hidden="true"><span>Przedmiot</span><span>Oceny</span><span>Średnia</span></div>
      ${blocks}
    </div>
    <p class="grades-hint">Rozwiń przedmiot, aby zobaczyć szczegóły ocen.</p>`;
}


/* =====================================================
   WSZYSTKO
===================================================== */

function renderRemarks(){
  const remarksBox=document.getElementById("remarks-content");

  if(remarksBox){

    const allRemarks=(remarksData||[]);

    remarksBox.innerHTML=allRemarks.length
      ? `<div class="st-card issues">`+allRemarks.map(item=>{

          const d=parseISODate(item.entry_date);
          const dayNum=d?d.getDate():"—";
          const monthStr=d?monthShort[d.getMonth()]:"";
          const isPraise=item.kind==="praise";

          return `
            <div class="issue">
              <div class="issue-date">
                <b>${dayNum}</b>
                <span>${monthStr}</span>
              </div>
              <div class="issue-body">
                <b>${escapeHTML(item.title|| (isPraise?"Pochwała":"Uwaga"))}</b>
                <span>${escapeHTML(item.content||"")}</span>
              </div>
              <div class="remark-badge ${isPraise?"praise":"remark"}">
                ${isPraise?"Pochwała":"Uwaga"}
              </div>
            </div>`;

        }).join("")+`</div>`
      : `<div class="st-card"><div class="st-empty">Brak uwag i pochwał.</div></div>`;

  }

}
function renderAll(){
  if(activePage==="start")renderStart();
  if(activePage==="plan")renderPlan();
  if(activePage==="frekwencja")renderAttendance();
  if(activePage==="oceny")renderOceny();
  if(activePage==="uwagi")renderRemarks();
}


/* =====================================================
   ZMIANA DATY
===================================================== */

function changeDay(delta){

  currentDate.setDate(
    currentDate.getDate()+delta
  );

  renderAll();

}


/* =====================================================
   WIDOKI
===================================================== */

function toggleMobileMenu(){
  const menu=document.querySelector("nav.bottom");
  const backdrop=document.getElementById("menu-backdrop");
  const button=document.getElementById("menu-toggle");
  const open=!menu.classList.contains("open");
  menu.classList.toggle("open",open);
  backdrop.classList.toggle("show",open);
  button.setAttribute("aria-expanded",String(open));
  button.setAttribute("aria-label",open?"Zamknij menu":"Otwórz menu");
}

function closeMobileMenu(){
  document.querySelector("nav.bottom").classList.remove("open");
  document.getElementById("menu-backdrop").classList.remove("show");
  const button=document.getElementById("menu-toggle");
  if(button){
    button.setAttribute("aria-expanded","false");
    button.setAttribute("aria-label","Otwórz menu");
  }
}

function showView(name){
  let url=diaryDestination(name);
  if(name==="frekwencja")url+="?date="+formatISODate(currentDate);
  location.assign(url);
}


/* =====================================================
   MODALE
===================================================== */

function openModal(name){

  const modal=
    document.getElementById(
      "modal-"+name
    );

  if(modal)
    modal.classList.add("show");


  if(name==="notatki"){

    document.getElementById("note-input")
      .value=
        localStorage.getItem(
          "dziennik_note"
        )||"";

  }

}


function closeModal(){

  document
    .querySelectorAll(".modal")
    .forEach(m=>m.classList.remove("show"));

}


/* =====================================================
   NOTATKI
===================================================== */

function saveNote(){

  const value=
    document
      .getElementById("note-input")
      .value
      .trim();


  localStorage.setItem(
    "dziennik_note",
    value
  );


  document.getElementById("note-status")
    .textContent=
      "Notatka została zapisana.";

}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value){

  return String(value??"")
    .replace(/[&<>"']/g,m=>({
      "&":"&amp;",
      "<":"&lt;",
      ">":"&gt;",
      '"':"&quot;",
      "'":"&#039;"
    }[m]));

}


/* =====================================================
   START
===================================================== */

window.addEventListener("pagehide",()=>{
  document.getElementById("diary-app").hidden=true;
});
window.addEventListener("pageshow",event=>{
  if(event.persisted)location.reload();
});
initAuth();

