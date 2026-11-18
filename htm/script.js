// ===== عدّل الجدول من هنا فقط =====
// day: 0=الأحد ... 4=الخميس
const SLOTS = [["08:00","10:00"],["10:00","12:00"],["13:30","16:30"]];
const DAYS = ["الأحد","الاثنين","الثلاثاء","الأربعاء","الخميس"];
const SESSIONS = [
  {id:1, day:0, start:"08:00", end:"12:00", subject:"البرمجة الإجرائية", teacher:"مسعودي إسماعيل", c:1},
  {id:2, day:0, start:"13:30", end:"16:30", subject:"نظم التشغيل والبرمجيات المكتبية", teacher:"مسعودي إسماعيل", c:2},
  {id:3, day:1, start:"08:00", end:"12:00", subject:"واجهة مستخدم ثابتة", teacher:"مسعودي إسماعيل", c:3},
  {id:4, day:1, start:"13:30", end:"16:30", subject:"الإنجليزية", teacher:"بوكلبوة عبد الغاني", c:4},
  {id:5, day:1, start:"13:30", end:"16:30", subject:"معالجة الصور", teacher:"", c:5},
  {id:6, day:2, start:"08:00", end:"12:00", subject:"واجهة مستخدم تفاعلية", teacher:"مسعودي إسماعيل", c:3},
  {id:7, day:3, start:"08:00", end:"12:00", subject:"نظام إدارة المحتوى", teacher:"مسعودي إسماعيل", c:6},
  {id:8, day:3, start:"13:30", end:"16:30", subject:"تطبيقات ويب أحادية الصفحة من جهة العميل", teacher:"", c:1},
  {id:9, day:4, start:"08:00", end:"10:00", subject:"إدارة المشاريع", teacher:"ميمون نادية", c:4},
  {id:10, day:4, start:"10:00", end:"12:00", subject:"الاتصال المهني", teacher:"كحول منيرة", c:2},
];

// ===== الدروس: أضف درسًا جديدًا بوضع ملفه في مجلد lessons ثم سطرًا هنا =====
const LESSONS = [
  {title:"منصة CSS3 التعليمية التفاعلية", desc:"مرجع شامل (118 سمة) + محاكي حي للتجربة", url:"lessons/css3.html"},
];

// ===== روابط محادثات القسم (ضع رابط المجموعة بين علامتي الاقتباس) =====
// واتساب: معلومات المجموعة ← الدعوة عبر رابط ← نسخ الرابط
const CHATS = [
  {name:"مجموعة الدفعة العامة", desc:"الإعلانات، الغيابات، تغيير القاعات", type:"واتساب", color:"#25d366", url:""},
  {name:"مجموعة تيليغرام للملفات", desc:"ملخصات الدروس وملفات PDF", type:"تيليغرام", color:"#37aee2", url:"https://web.telegram.org/a/#-1003914784921"},
  {name:"مجموعة الفيسبوك", desc:"نقاش عام وأخبار المعهد", type:"فيسبوك", color:"#6b8cff", url:""},
  {name:"ديسكورد للمطورين", desc:"أسئلة البرمجة وتبادل المشاريع", type:"ديسكورد", color:"#8a8dff", url:""},
];
// ==================================

const $ = id => document.getElementById(id);
const mins = t => { const [h,m] = t.split(":").map(Number); return h*60+m; };
const color = n => `var(--c${n})`;
// getDay(): الأحد=0 ... السبت=6 ، والدراسة من الأحد إلى الخميس
const todayIdx = () => new Date().getDay();

function buildTable(){
  const today = todayIdx();
  let html = `<thead><tr><th></th>${SLOTS.map(s=>`<th>${s[0]} - ${s[1]}</th>`).join("")}</tr></thead><tbody>`;
  DAYS.forEach((name, d) => {
    html += `<tr><th class="day ${d===today?"is-today":""}">${name}</th>`;
    const covers = (s,i) => s.day===d && mins(s.start)<=mins(SLOTS[i][0]) && mins(s.end)>=mins(SLOTS[i][1]);
    let i = 0;
    while(i < SLOTS.length){
      const list = SESSIONS.filter(s=>covers(s,i));
      if(!list.length){ html += `<td class="empty"></td>`; i++; continue; }
      let span = 1;
      const key = l => l.map(s=>s.id).join();
      while(i+span<SLOTS.length && key(SESSIONS.filter(s=>covers(s,i+span)))===key(list)) span++;
      const inner = list.map(s=>`<div class="s">${s.subject}</div>${s.teacher?`<div class="t">${s.teacher}</div>`:""}`).join("");
      html += `<td class="sub" colspan="${span}" style="--c:${color(list[0].c)}">${inner}</td>`;
      i += span;
    }
    html += `</tr>`;
  });
  $("timetable").innerHTML = html + "</tbody>";
}

function update(){
  const now = new Date(), d = now.getDay(), cur = now.getHours()*60+now.getMinutes();
  const todays = SESSIONS.filter(s=>s.day===d).sort((a,b)=>mins(a.start)-mins(b.start));
  $("todayTitle").textContent = d<=4 ? `حصص اليوم (${DAYS[d]})` : "اليوم عطلة";
  $("todayList").innerHTML = todays.length ? todays.map(s=>{
    const live = cur>=mins(s.start) && cur<mins(s.end);
    return `<li class="${live?"live":""}" style="--c:${color(s.c)}"><span>${s.subject}${s.teacher?`<br><small>${s.teacher}</small>`:""}</span><small>${s.start} - ${s.end}${live?" · الآن":""}</small></li>`;
  }).join("") : `<li style="--c:var(--muted)"><span>لا توجد حصص</span></li>`;

  // أقرب حصة قادمة خلال الأسبوع
  let best = null;
  SESSIONS.forEach(s=>{
    let diff = (s.day-d)*1440 + mins(s.start) - cur;
    if(diff<=0) diff += 7*1440;
    if(!best || diff<best.diff) best = {s,diff};
  });
  if(!best) return;
  const {s,diff} = best, days = Math.floor(diff/1440), h = Math.floor(diff%1440/60), m = diff%60;
  $("nextSubject").textContent = s.subject;
  $("nextWhen").textContent = `${DAYS[s.day]} ${s.start} · بعد ` +
    [days&&`${days} يوم`, h&&`${h} ساعة`, `${m} دقيقة`].filter(Boolean).join(" و ");
}

buildTable(); update(); setInterval(update, 30000);

// ===== الأيقونات =====
const ICONS = {
  home:"M3 11l9-8 9 8v10a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z",
  table:"M3 6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2zM3 10h18M9 10v10",
  chat:"M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z",
  book:"M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2zM4 19V5M8 7h7",
  print:"M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2M7 14h10v7H7z",
  arrow:"M15 6l-6 6 6 6",
  code:"M8 7l-5 5 5 5M16 7l5 5-5 5M14 4l-4 16"
};
const icon = n => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${ICONS[n]}"/></svg>`;
document.querySelectorAll("[data-i]").forEach(el => el.innerHTML = icon(el.dataset.i));

// ===== المحادثات =====
$("chatGrid").innerHTML = CHATS.map(c => {
  const body = `<span class="dot">${icon("chat")}</span>
    <span class="ct"><b>${c.name}</b><small>${c.desc}</small></span>
    <span class="tag">${c.url ? "انضم · " + c.type : "أضف الرابط"}</span>`;
  return c.url
    ? `<a class="chat" href="${c.url}" target="_blank" rel="noopener">${body}</a>`
    : `<div class="chat off" title="ضع الرابط في CHATS داخل script.js">${body}</div>`;
}).join("");

// ===== الدروس =====
$("lessonGrid").innerHTML = LESSONS.map(l =>
  `<a class="chat" href="${l.url}"><span class="dot">${icon("code")}</span><span class="ct"><b>${l.title}</b><small>${l.desc}</small></span><span class="tag">افتح الدرس</span></a>`).join("");

// ===== المواد والأساتذة =====
const subj = {};
SESSIONS.forEach(s => { (subj[s.subject] ||= {c:s.c, t:s.teacher, w:[]}).w.push(`${DAYS[s.day]} ${s.start}-${s.end}`); });
$("subjectList").innerHTML = Object.entries(subj).map(([n,v]) =>
  `<li style="--c:${color(v.c)}"><b>${n}</b><span>${v.t || "الأستاذ غير محدد"}</span><small>${v.w.join(" · ")}</small></li>`).join("");

// ===== التنقل بين الصفحات =====
function route(){
  const id = (location.hash.slice(1) || "home");
  const view = document.getElementById(id);
  const ok = view && view.classList.contains("view");
  document.querySelectorAll(".view").forEach(v => v.classList.toggle("active", v === (ok ? view : $("home"))));
  document.querySelectorAll(".dock a").forEach(a => a.classList.toggle("on", a.getAttribute("href") === "#" + (ok ? id : "home")));
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", route); route();
$("printBtn").onclick = () => window.print();
