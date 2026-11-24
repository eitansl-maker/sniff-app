window.SNIFF_BOOT=function(B,P,ME){
const C=window.SNIFF_CONFIG;
const $=s=>document.querySelector(s),view=$('#view');
document.title=C.appName;$('#appName').textContent=C.appName;
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
  const words=norm(q).split(/[\s,.;!?]+/).filter(Boolean);
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
          terms.forEach(t=>{if(hs.includes(t)){score+= (t===st?2:1.5)+(it.m&&norm(it.m.name+' '+it.m.audience).includes(t)?1:0);got=true}})
        });
        if(got)hits++;
      });
      if(hits)out.push({b,m:it.m,score:score+hits*2,hits,of:words.length});
    });
  });
  out.sort((x,y)=>y.score-x.score);
  const seen=new Set();return out.filter(r=>{const k=r.b.id+'|'+(r.m?r.m.name:'');if(seen.has(k))return false;seen.add(k);return showInactive||r.b.status==='active'}).slice(0,12);
}
function brandCard(b,extra){
  const off=b.status==='inactive';
  return `<div class="card ${off?'off':''}" data-b="${b.id}"><h3>${esc(b.he)} <span class="sub">${esc(b.name)}</span>${off?'<span class="badge off">לא פעיל</span>':''}</h3><div class="sub">${esc(b.type)} · ${esc(b.origin)}</div><p>${esc(b.audience)}</p>${extra||''}</div>`}
function viewSearch(){
  view.innerHTML=`<div class="search"><span>🔎</span><input id="q" placeholder='למשל: נעלי ריצה לילדה, סנדל עמיד במים, נעל לכאבי רגליים' autocomplete="off"></div>
  <div class="chips">${['נעלי ריצה','סנדל עמיד במים','מגפי חורף','תמיכה בקשת','רגל רחבה','טבעוני','תיק גב','נעל קלה מאוד'].map(x=>`<button class="chip" data-q="${x}">${x}</button>`).join('')}</div>
  <label class="toggle"><input type="checkbox" id="inact" ${showInactive?'checked':''}> הצג גם מותגים לא פעילים</label>
  <div class="hint">אפשר לכתוב כמו שלקוח מדבר. המערכת מבינה נושאים כמו ריצה, ילדים, מים, נוחות ותמיכה, ומציגה את המותג והדגם המתאימים.</div><div id="res"></div>`;
  const q=$('#q'),res=$('#res');
  const run=()=>{const r=search(q.value);
    if(!q.value.trim()){res.innerHTML='';return}
    res.innerHTML=r.length?r.map(x=>`<div class="result">${brandCard(x.b,x.m?`<div class="tags"><span class="tag">דגם: ${esc(x.m.name)}</span></div><p><b>${esc(x.m.name)}:</b> ${esc(x.m.audience)}</p>`:'')}</div>`).join(''):'<div class="hint">לא נמצאה התאמה. נסו מילים אחרות, למשל: ריצה, גשם, נוחות, ילדים.</div>';
    bind()};
  q.addEventListener('input',run);
  document.querySelectorAll('.chip').forEach(c=>c.onclick=()=>{q.value=c.dataset.q;run()});
  $('#inact').onchange=e=>{showInactive=e.target.checked;run()};
  q.focus();
}
function viewBrands(){
  const all=[...new Set(B.flatMap(b=>b.tags))].sort();
  view.innerHTML=`<div class="chips">${all.slice(0,30).map(t=>`<button class="chip ${tag===t?'on':''}" data-t="${t}">${esc(t)}</button>`).join('')}</div>
  <label class="toggle"><input type="checkbox" id="inact" ${showInactive?'checked':''}> הצג גם מותגים לא פעילים</label>
  <div class="grid">${B.filter(b=>(showInactive||b.status==='active')&&(!tag||b.tags.includes(tag))).map(b=>brandCard(b,`<div class="tags">${b.tags.slice(0,4).map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>`)).join('')}</div>`;
  document.querySelectorAll('.chip').forEach(c=>c.onclick=()=>{tag=tag===c.dataset.t?null:c.dataset.t;viewBrands()});
  $('#inact').onchange=e=>{showInactive=e.target.checked;viewBrands()};
  bind();
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
function bind(){document.querySelectorAll('.card[data-b]').forEach(c=>c.onclick=()=>{location.hash='#/brand/'+c.dataset.b})}
function route(){
  const h=location.hash;
  if(h.startsWith('#/brand/'))return viewBrand(h.slice(8));
  const t=h.replace('#/','')||'search';
  document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));
  ({search:viewSearch,brands:viewBrands,sales:viewSales}[t]||viewSearch)();
}
document.querySelectorAll('#tabs button').forEach(b=>b.onclick=()=>{location.hash='#/'+b.dataset.t});
window.addEventListener('hashchange',route);route();
if('serviceWorker' in navigator)navigator.serviceWorker.register('sw.js').catch(()=>{});
};
