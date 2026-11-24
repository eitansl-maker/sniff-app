window.SNIFF_BOOT=function(B,P,ME){
const C=window.SNIFF_CONFIG;
const $=s=>document.querySelector(s),view=$('#view');
document.title=C.appName;$('#ver').textContent='גרסה '+C.version;$('#appName').textContent=C.appName;
$('#branchBox').innerHTML=`<b>${esc(ME.branchName||'מטה')}${ME.branchNumber?` · מס' ${esc(ME.branchNumber)}`:''}</b><br>${esc(ME.orgName||'')}`;
$('#userBox').innerHTML=(ME.photo?`<img class="avatar" src="${esc(ME.photo)}" alt="">`:`<div class="avatar">${esc((ME.name||'?')[0])}</div>`)+`<span>${esc(ME.name||'')}${ME.title?`<br><small>${esc(ME.title)}</small>`:''}</span><button class="chip" id="logout">יציאה</button>`;
$('#logout').onclick=ME.logout;
let showInactive=false,tag=null;
function esc(s){return String(s).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}

// מילון נרדפים: מילה בחיפוש חופשי -> תגיות/מילים במאגר
const SYN={
 'ריצה':['ריצה','רץ','רצים'],'ילד':['ילדים','ילד','ילדה'],'ילדה':['ילדים'],'ילדים':['ילדים'],
 'גשם':['גשם','עמיד במים','מגפיים'],'מים':['עמיד במים','מים'],'עמיד':['עמיד במים'],'חורף':['חורף','מגפיים','גשם'],
 'סנדל':['סנדל','סנדלים'],'כפכף':['כפכפים'],'כפכפים':['כפכפים'],'מגף':['מגפיים'],'מגפיים':['מגפיים'],
 'טיול':['טיולים','שטח'],'טיולים':['טיולים','שטח'],'שטח':['שטח'],'הליכה':['הליכה','נוחות'],
 'נוח':['נוחות'],'נוחות':['נוחות'],'רגל':['רגל רחבה'],'רחבה':['רגל רחבה'],'רחב':['רגל רחבה'],
 'עמידה':['עמידה ארוכה','נוחות'],'כאבים':['נוחות','בלימת זעזועים','אורטופדי'],'אורטופדי':['אורטופדי'],
 'קשת':['קשת','תמיכה'],'פלטפוס':['פלטפוס','תמיכה'],'תמיכה':['תמיכה'],'שטוחה':['פלטפוס','תמיכה'],
 'טבעוני':['טבעוני'],'ממוחזר':['מחוזר','אקולוגי'],'אקולוגי':['אקולוגי'],'קל':['קל'],'מהיר':['מהיר','תחרות'],
 'תחרות':['תחרות'],'ספורט':['ספורט','אימון'],'כושר':['חדר כושר','אימון'],'ברפוט':['ברפוט'],'תיק':['תיק'],'תיקים':['תיק'],
 'גב':['תיק'],'סטודנט':['סטודנטים'],'אופנתי':['אופנתי'],'צבעוני':['צבעוני'],'עור':['עור'],'התאוששות':['התאוששות'],
 'כביסה':['מכונת כביסה'],'ישראלי':['ישראלי'],'גברים':['גברים'],'נשים':['נשים'],'גורטקס':['גורטקס'],'קרם':['טיפוח']
};
const PREF=['וה','ול','וב','ש','ה','ל','ב','ו','כ','מ'];
function stems(w){const o=[w];for(const p of PREF){if(w.startsWith(p)&&w.length-p.length>=2)o.push(w.slice(p.length))}return o}
function norm(s){return s.replace(/[׳'"״]/g,'').toLowerCase()}
function haystack(b,m){return norm([b.name,b.he,b.type,b.origin,b.audience,(b.tags||[]).join(' '),(b.points||[]).join(' '),m?m.name+' '+m.audience+' '+(m.tags||[]).join(' '):''].join(' '))}
function search(q){
  const STOP=new Set(['מוצר','מוצרים','נעל','נעלי','נעליים','מותג','מותגים','דגם','דגמים','של','עם','בלי','או','גם','לי','אני','רוצה','מחפש','מחפשת','צריך','צריכה','יש','לך','את','אותו']);
  const words=norm(q).split(/[\s,.;!?]+/).filter(w=>w&&!STOP.has(w));
  if(!words.length)return[];
  const out=[];
  B.forEach(b=>{
    const items=[{m:null}].concat((b.models||[]).map(m=>({m})));
    items.forEach(it=>{
      const hs=haystack(b,it.m);let score=0,hits=0;
      words.forEach(w=>{
        let got=false;
        stems(w).forEach(st=>{
          const terms=[st].concat((SYN[st]||[]).map(norm));
          terms.forEach(t=>{const hay=(st==='ישראלי'||st==='ישראל')?norm(((b.tags||[]).join(' '))+' '+(b.origin||'')):hs;if(st==='ישראלי'||st==='ישראל'){if(!(((b.tags||[]).includes('ישראלי'))||/ישראל/.test(b.origin||'')))return}
          if(hay.includes(t)){score+= (t===st?2:1.5)+(it.m&&norm(it.m.name+' '+it.m.audience).includes(t)?1:0);got=true}})
        });
        if(got)hits++;
      });
      if(hits)out.push({b,m:it.m,score:score+hits*2,hits,of:words.length});
    });
  });
  out.sort((x,y)=>y.score-x.score);
  const full=out.filter(r=>r.hits===r.of);if(full.length){out.length=0;out.push(...full)}
  const seen=new Set();return out.filter(r=>{const k=r.b.id+'|'+(r.m?r.m.name:'');if(seen.has(k))return false;seen.add(k);return showInactive||r.b.status==='active'}).slice(0,12);
}
const HUES=[[37,99,235],[124,58,237],[219,39,119],[234,88,12],[5,150,105],[8,145,178],[202,138,4]];
function bav(b){let n=0;for(const c of b.name)n+=c.charCodeAt(0);const h=HUES[n%HUES.length];return `<div class="bav" style="background:linear-gradient(135deg,rgb(${h}),rgb(${h.map(x=>Math.round(x*.7)).join(',')}))">${esc(b.name[0].toUpperCase())}</div>`}
function brandCard(b,extra,m){
  const off=b.status==='inactive';
  const title=m?`${esc(b.he)} ${esc(m.name)}`:esc(b.he);
  const sub=m?`${esc(b.name)} · ${esc(b.type)}`:`${esc(b.name)} · ${esc(b.type)} · ${esc(b.origin)}`;
  return `<div class="card ${off?'off':''}" data-b="${b.id}">${bav(b)}<h3>${title}${off?'<span class="badge off">לא פעיל</span>':''}</h3><div class="sub">${sub}</div><div class="rest"><p>${esc(m?m.audience:b.audience)}</p>${extra||''}</div></div>`}
function viewSearch(){
  const tags=[...new Set(B.flatMap(b=>b.tags))].sort((x,y)=>x.localeCompare(y,'he'));
  view.innerHTML=`<div class="hello">שלום ${esc((ME.name||'').split(' ')[0])}, מה מחפשים היום?</div><div class="search"><span>🔎</span><input id="q" placeholder='חפשו כמו שלקוח מדבר: נעלי ריצה לילדה, סנדל עמיד במים' autocomplete="off"><button class="mic" id="mic" title="חיפוש קולי" aria-label="חיפוש קולי">🎤</button></div>
  <div class="chips">${tags.slice(0,30).map(t=>`<button class="chip ${tag===t?'on':''}" data-t="${esc(t)}">${esc(t)}</button>`).join('')}</div>
  <label class="toggle"><input type="checkbox" id="inact" ${showInactive?'checked':''}> הצג גם מותגים לא פעילים</label>
  <div id="res"></div>`;
  const q=$('#q'),res=$('#res');
  const run=()=>{
    if(q.value.trim()){
      const r=search(q.value);
      res.innerHTML=r.length?'<div class="hint">התוצאות מסודרות לפי התאמה</div>'+r.map(x=>`<div class="result">${brandCard(x.b,'',x.m)}</div>`).join(''):'<div class="hint">לא נמצאה התאמה. נסו מילים אחרות, למשל: ריצה, גשם, נוחות, ילדים.</div>';
    }else{
      const l=B.filter(b=>(showInactive||b.status==='active')&&(!tag||b.tags.includes(tag)));
      res.innerHTML=`<div class="hint">${l.length} מותגים, בסדר א' ב'</div><div class="grid">${l.map(b=>brandCard(b,`<div class="tags">${b.tags.slice(0,4).map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>`)).join('')}</div>`;
    }
    bind()};
  q.addEventListener('input',run);
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition,mic=$('#mic');
  if(!SR)mic.style.display='none';else{let rec=null;mic.onclick=()=>{
    if(rec){rec.stop();return}
    rec=new SR();rec.lang='he-IL';rec.interimResults=true;rec.maxAlternatives=1;
    mic.classList.add('rec');q.placeholder='מקשיב... אפשר לדבר';
    rec.onresult=e=>{q.value=Array.from(e.results).map(r=>r[0].transcript).join(' ');run()};
    rec.onerror=()=>{};rec.onend=()=>{rec=null;mic.classList.remove('rec');q.placeholder='חפשו כמו שלקוח מדבר: נעלי ריצה לילדה, סנדל עמיד במים'};
    try{rec.start()}catch(err){rec=null;mic.classList.remove('rec')}}}
  document.querySelectorAll('.chip[data-t]').forEach(c=>c.onclick=()=>{tag=tag===c.dataset.t?null:c.dataset.t;const v=q.value;viewSearch();$('#q').value=v;$('#q').dispatchEvent(new Event('input'))});
  $('#inact').onchange=e=>{showInactive=e.target.checked;run()};
  run();
}
function viewBrand(id){
  const b=B.find(x=>x.id===id);const off=b.status==='inactive';
  view.innerHTML=`<button class="back" id="back">→ חזרה</button><div class="panel ${off?'off':''}"><h2>${esc(b.he)} <span class="sub">${esc(b.name)}</span>${off?'<span class="badge off">לא פעיל, כבר לא נמכר בחנות</span>':''}</h2>
  <div class="sub">${esc(b.type)} · ${esc(b.origin)}</div>
  <p><b>למי זה מתאים:</b> ${esc(b.audience)}</p>
  <b>נקודות מכירה</b><ul>${b.points.map(p=>`<li>${esc(p)}</li>`).join('')}</ul>
  <div class="tags">${b.tags.map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>
  ${b.models?`<h3>דגמים</h3>${b.models.map(m=>`<div class="model"><b>${esc(m.name)}</b><div>${esc(m.audience)}</div></div>`).join('')}`:''}</div>`;
  $('#back').onclick=()=>history.back();
}
function viewSales(){
  view.innerHTML=`<div class="panel"><h2>ארבעת שלבי המכירה</h2>${P.stages.map((s,i)=>`<div class="stage"><div class="n">${i+1}</div><div><b>${s.name}</b> <span class="sub">${s.en}</span><div>${s.text}</div></div></div>`).join('')}<p class="hint">${P.newModel}</p></div>
  <div class="panel"><h2>עקרונות בסיס לאנשי השירות</h2><ul>${P.staff.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>
  <div class="panel"><h2>עקרונות בסיס חנויות</h2><ul>${P.store.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`;
}

const KIND={morning:'בוקר',evening:'ערב',other:'אחר'};
const today=()=>new Date().toLocaleDateString('sv');
async function viewHR(){
  const sb=ME.sb;view.innerHTML='<div class="hint">טוען...</div>';
  const day=window.__hrDay||today();
  const [br,pp,sh]=await Promise.all([sb.from('sniff_branches').select('id,name,number,org_id').order('name'),sb.from('sniff_people').select('*').eq('active',true).order('name'),sb.from('sniff_shifts').select('*').eq('day',day)]);
  if(br.error||pp.error||sh.error){view.innerHTML='<div class="hint">שגיאה בטעינה, נסו שוב.</div>';return}
  pp.data.sort((x,y)=>x.name.localeCompare(y.name,'he'));br.data.sort((x,y)=>x.name.localeCompare(y.name,'he'));
  const can=['hq','manager','area_manager','format_manager'].includes(ME.role);
  const P={};pp.data.forEach(x=>P[x.id]=x);
  const st={planned:'',confirmed:' ✅',cant:' ❌ לא יכול'};
  const contact=x=>`<span class="ppl"><b>${esc(x.name)}</b>${x.title?` <small>${esc(x.title)}</small>`:''}${x.phone?` <a class="call" href="tel:${esc(x.phone)}">📞 ${esc(x.phone)}</a>`:''}${x.email?` <a class="call" href="mailto:${esc(x.email)}">✉️</a>`:''}</span>`;
  view.innerHTML=`<div class="hint">משמרות ליום <input type="date" id="hrday" value="${day}"></div>`+br.data.map(b=>{
    const mine=pp.data.filter(x=>x.branch_id===b.id),s=sh.data.filter(x=>x.branch_id===b.id);
    const col=k=>{const l=s.filter(x=>x.kind===k);return `<div class="shift"><b>${KIND[k]}</b> (${l.length})${l.length?l.map(x=>{const q=P[x.person_id];if(!q)return'';const me=q.user_id===ME.userId;return `<div class="row">${contact(q)}${x.note?` <span class="tag">${esc(x.note)}</span>`:''}${st[x.status]}${me?` <button class="chip" data-a="ok" data-id="${x.id}">אני יכול</button><button class="chip" data-a="cant" data-id="${x.id}">לא יכול</button>`:''}${can?` <button class="chip" data-a="del" data-id="${x.id}">הסר</button>`:''}</div>`}).join(''):'<div class="hint">אין שיבוץ</div>'}</div>`};
    return `<div class="panel"><h3>${esc(b.name)}${b.number?` · מס' ${esc(b.number)}`:''}</h3><div class="two">${col('morning')}${col('evening')}</div>${s.some(x=>x.kind==='other')?col('other'):''}
    ${can?`<div class="seg"><button class="chip big" data-m="shift">שיבוץ עובד למשמרת</button><button class="chip big" data-m="new">הוספת עובד חדש</button></div>
    <div class="mode" data-mode="shift" hidden>${mine.length?`<div class="hint">שיבוץ ליום <b>${esc(day.split("-").reverse().join("."))}</b> (אפשר לשנות את היום בראש המסך)</div><label>עובד<select class="psel">${mine.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('')}</select></label><label>משמרת<select class="ksel"><option value="morning">בוקר</option><option value="evening">ערב</option><option value="other">אחר (לכתוב במילים)</option></select></label><label class="onote" hidden>פירוט המשמרת<input class="note" placeholder="למשל: משמרת מיוחדת, סגירת חג, 10:00-14:00"></label><button class="chip big pri" data-a="add" data-b="${b.id}">שמור שיבוץ</button>`:'<div class="hint">עוד אין עובדים בסניף. קודם יש להוסיף עובד חדש.</div><button class="chip big" data-m="new" data-go="1">הוספת עובד חדש</button>'}</div>
    <div class="mode" data-mode="new" hidden><label>שם<input class="nm"></label><label>טלפון<input class="ph" inputmode="tel"></label><label>מייל (לכניסה עם גוגל)<input class="em" inputmode="email"></label><label>תפקיד<input class="tt"></label><button class="chip big pri" data-a="newp" data-b="${b.id}">שמור עובד</button></div>`:''}
    <details><summary>כל אנשי הצוות (${mine.length})</summary>${mine.map(x=>`<div class="row">${contact(x)}</div>`).join('')||'<div class="hint">עוד לא נוספו עובדים</div>'}</details></div>`}).join('')||'<div class="hint">אין סניפים להצגה</div>';
  view.querySelectorAll('button[data-m]').forEach(btn=>btn.onclick=()=>{const box=btn.closest('.panel');box.querySelectorAll('.mode').forEach(m=>m.hidden=m.dataset.mode!==btn.dataset.m);box.querySelectorAll('button[data-m]').forEach(x=>x.classList.toggle('pri',x===btn))});
  view.querySelectorAll('.ksel').forEach(k=>k.onchange=()=>{k.closest('.mode').querySelector('.onote').hidden=k.value!=='other'});
  view.querySelectorAll('.panel').forEach(pn=>{const b=pn.querySelector('button[data-m]');if(b){const hasP=pn.querySelector('.psel');pn.querySelector(hasP?'button[data-m=shift]':'button[data-m=new]').click()}});
  $('#hrday').onchange=e=>{window.__hrDay=e.target.value;viewHR()};
  view.querySelectorAll('button[data-a]').forEach(btn=>btn.onclick=async()=>{
    const a=btn.dataset.a,box=btn.closest('.panel');let r;
    if(a==='del')r=await sb.from('sniff_shifts').delete().eq('id',btn.dataset.id);
    else if(a==='ok'||a==='cant')r=await sb.from('sniff_shifts').update({status:a==='ok'?'confirmed':'cant'}).eq('id',btn.dataset.id);
    else if(a==='add'){const pid=box.querySelector('.psel').value;if(!pid)return alert('אין עובד לשיבוץ');r=await sb.from('sniff_shifts').insert({branch_id:btn.dataset.b,person_id:pid,day,kind:box.querySelector('.ksel').value,note:box.querySelector('.ksel').value==='other'?(box.querySelector('.note').value.trim()||null):null})}
    else if(a==='newp'){const n=box.querySelector('.nm').value.trim();if(!n)return;const org=br.data.find(x=>x.id===btn.dataset.b).org_id;r=await sb.from('sniff_people').insert({org_id:org,branch_id:btn.dataset.b,name:n,phone:box.querySelector('.ph').value.trim()||null,email:box.querySelector('.em').value.trim().toLowerCase()||null,title:box.querySelector('.tt').value.trim()||null})}
    if(r&&r.error)alert('לא הצליח: '+r.error.message);else viewHR();
  });
}
function bind(){document.querySelectorAll('.card[data-b]').forEach(c=>c.onclick=()=>{location.hash='#/brand/'+c.dataset.b})}
function route(){
  const h=location.hash;
  if(h.startsWith('#/brand/'))return viewBrand(h.slice(8));
  const t=h.replace('#/','')||'search';
  document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));
  ({search:viewSearch,brands:viewSearch,sales:viewSales,hr:viewHR}[t]||viewSearch)();
}
document.querySelectorAll('#tabs button').forEach(b=>b.onclick=()=>{location.hash='#/'+b.dataset.t});
window.addEventListener('hashchange',route);route();
let dip=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();dip=e;$('#install').style.display='inline-block'});
$('#install').onclick=async()=>{if(dip){dip.prompt();await dip.userChoice;dip=null;$('#install').style.display='none'}};
if(/iphone|ipad/i.test(navigator.userAgent)&&!navigator.standalone){const i=$('#install');i.style.display='inline-block';i.onclick=()=>alert('בספארי: כפתור השיתוף ואז "הוספה למסך הבית"')}
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
};
