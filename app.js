window.SNIFF_BOOT=function(B,P,ME){
const C=window.SNIFF_CONFIG;
const $=s=>document.querySelector(s),view=$('#view');
document.title=C.appName;$('#ver').textContent='גרסה '+C.version;$('#appName').textContent=C.appName;
$('#branchBox').innerHTML=`<b>${esc(ME.branchName||'מטה')}${ME.branchType==='outlet'?' · אאוטלט':''}${ME.branchNumber?` · מס' ${esc(ME.branchNumber)}`:''}</b> <small>${esc(ME.orgName||'')}</small>`;
const av=ME.photo?`<img class="avatar" src="${esc(ME.photo)}" alt="" referrerpolicy="no-referrer" onerror="this.outerHTML='<div class=avatar>'+this.dataset.l+'</div>'" data-l="${esc((ME.name||'?')[0])}">`:`<div class="avatar">${esc((ME.name||'?')[0])}</div>`;
$('#userBox').innerHTML=`<button class="avbtn" id="avbtn" aria-label="תפריט משתמש">${av}</button><div class="umenu" id="umenu" hidden><b>${esc(ME.name||'')}</b>${ME.title?`<small>${esc(ME.title)}</small>`:''}<small>${esc(ME.email||'')}</small><button class="chip" id="share" title="שיתוף">שיתוף ⤴</button><button class="chip" id="logout">יציאה</button></div>`;
$('#avbtn').onclick=e=>{e.stopPropagation();$('#umenu').hidden=!$('#umenu').hidden};
document.addEventListener('click',e=>{const m=$('#umenu');if(m&&!m.hidden&&!m.contains(e.target))m.hidden=true});
let lastY=0;window.addEventListener('scroll',()=>{const y=window.scrollY,h=document.querySelector('header');if(y>lastY+8&&y>80)h.classList.add('hide');else if(y<lastY-8||y<20)h.classList.remove('hide');lastY=y},{passive:true});
$('#logout').onclick=ME.logout;
$('#share').onclick=async()=>{const d={title:'סניף',text:'האפליקציה של הצוות, כניסה עם Google למי שאושר:',url:location.origin+location.pathname};try{if(navigator.share)await navigator.share(d);else{await navigator.clipboard.writeText(d.url);alert('הקישור הועתק')}}catch(e){}};
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
function stems(w){const o=[w];for(const p of PREF){if(w.startsWith(p)&&w.length-p.length>=(p.length===1?4:3))o.push(w.slice(p.length))}return o}
function norm(s){return s.replace(/[׳'"״]/g,'').toLowerCase()}
function haystack(b,m){return norm([b.name,b.he,b.type,b.origin,b.audience,(b.tags||[]).join(' '),(b.points||[]).join(' '),m?m.name+' '+m.audience+' '+(m.tags||[]).join(' '):''].join(' '))}
const CAT=ME.catalog||[];
const nrm=s=>String(s||'').toLowerCase().replace(/[^a-z0-9א-ת]/g,'');
const ALIAS={naturalworld:['ntrlworld'],xeroshoes:['xero'],oscars:['oscars'],freedomoses:['freedomoses'],freedommoses:['freedomoses'],ilsejacobsen:['ilsejacobsen'],heydude:['heydude'],candy:['candy','magma','seventynine'],candymagmaseventynine:['candy','magma','seventynine']};
function brandCat(b){const k=[nrm(b.name),nrm(b.he)].filter(Boolean);nrm(b.name).split('').length&&k.push(...(ALIAS[nrm(b.name)]||[]),...(ALIAS[nrm(String(b.name).split('/')[0])]||[]));return CAT.filter(c=>{const v=nrm(c.brand);return k.some(x=>v===x||(x.length>3&&(v.includes(x)||x.includes(v))&&v.length>3))})}
const fmt=(a,b)=>`₪${Math.round(a)}${b>a?'-'+Math.round(b):''}`;
function priceTxt(c){const out=ME.branchType==='outlet';
  let lo=out&&c.outlet_price_min?c.outlet_price_min:(c.regular_price_min||c.price_min),hi=out&&c.outlet_price_min?c.outlet_price_max:(c.regular_price_max||c.price_max);
  if(out&&!c.outlet_price_min&&c.regular_price_min&&!c.outlet_available&&c.outlet_available!==undefined&&false)return'';
  if(!lo)return'';return` · ${fmt(lo,hi)}${out&&c.outlet_price_min?' (אאוטלט)':''}`}
function catCard(c){return `<div class="card cat"><div class="bav" style="background:#e5e7eb;overflow:hidden">${c.image?`<img src="${esc(c.image)}" alt="" loading="lazy" referrerpolicy="no-referrer" style="width:100%;height:100%;object-fit:cover">`:'👟'}</div><h3>${esc(String(c.title||'').toLowerCase().includes(String(c.brand||'').toLowerCase())?c.title:(c.brand+' '+c.title))}</h3><div class="sub">${esc(c.product_type||'')}${priceTxt(c)}${c.available===false?' · אזל':''}</div><div class="rest"><div class="tags">${(c.colors||[]).map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>${c.url?`<p><a class="call" href="${esc(c.url)}" target="_blank" rel="noopener">לעמוד באתר</a></p>`:''}</div></div>`}
const INACT=new Set(B.filter(b=>b.status==='inactive').flatMap(b=>[nrm(b.name),nrm(b.he)].filter(Boolean)));
const isInact=c=>INACT.has(nrm(c.brand));
function searchCat(q){const w=norm(q).split(/[\s,.;!?]+/).filter(x=>x&&!['מוצר','מוצרים','נעל','נעלי','נעליים','של','עם'].includes(x));if(!w.length)return[];
  return CAT.map(c=>{const hs=norm([c.brand,c.title,c.product_type,(c.tags||[]).join(' '),(c.colors||[]).join(' ')].join(' '));let n=0;w.forEach(x=>{if(stems(x).some(s=>[s].concat((SYN[s]||[]).map(norm)).some(t=>hs.includes(t))))n++});return{c,n}}).filter(r=>r.n===w.length&&r.c.available!==false&&(showInactive||!isInact(r.c))).slice(0,30).map(r=>r.c)}
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
const hasCat=b=>!CAT.length||(b.models||[]).length>0||brandCat(b).length>0;
function viewSearch(){
  const tags=[...new Set(B.flatMap(b=>b.tags))].sort((x,y)=>x.localeCompare(y,'he'));
  view.innerHTML=`<div class="hello">שלום ${esc((ME.name||'').split(' ')[0])}, מה מחפשים היום?</div><div class="search"><span>🔎</span><input id="q" placeholder='חפשו כמו שלקוח מדבר: נעלי ריצה לילדה, סנדל עמיד במים' autocomplete="off"><button class="mic" id="clr" title="מחיקה" aria-label="מחיקה" hidden style="font-size:22px">✕</button><button class="mic" id="mic" title="חיפוש קולי" aria-label="חיפוש קולי">🎤</button></div>
  <div class="chips">${tags.slice(0,30).map(t=>`<button class="chip ${tag===t?'on':''}" data-t="${esc(t)}">${esc(t)}</button>`).join('')}</div>
  <label class="toggle"><input type="checkbox" id="inact" ${showInactive?'checked':''}> הצג גם מותגים לא פעילים</label>
  <div id="res"></div>`;
  const q=$('#q'),res=$('#res');
  const run=()=>{
    if(q.value.trim()){
      const r=search(q.value).filter(x=>hasCat(x.b));
      const cr=searchCat(q.value);
      res.innerHTML=(r.length||cr.length)?(cr.length?'<div class="hint">מהקטלוג של החנות</div><div class="grid">'+cr.map(catCard).join('')+'</div>':'')+(r.length?'<div class="hint">'+(cr.length?'מותגים קשורים':'התוצאות מסודרות לפי התאמה')+'</div>'+r.map(x=>`<div class="result">${brandCard(x.b,'',x.m)}</div>`).join(''):''):'<div class="hint">לא נמצאו נתונים. נסו מילים אחרות, למשל: ריצה, גשם, נוחות, ילדים.</div>';
    }else{
      const l=B.filter(b=>(showInactive||b.status==='active')&&(!tag||(b.tags.includes(tag)&&hasCat(b))));
      if(!l.length){res.innerHTML='<div class="hint">לא נמצאו נתונים</div>';bind();return}
      res.innerHTML=`<div class="hint">${l.length} מותגים, בסדר א' ב'</div><div class="grid">${l.map(b=>brandCard(b,`<div class="tags">${b.tags.slice(0,4).map(t=>`<span class="tag">${esc(t)}</span>`).join('')}</div>`)).join('')}</div>`;
    }
    bind()};
  const clr=$('#clr');
  q.addEventListener('input',()=>{clr.hidden=!q.value;run()});
  clr.onclick=()=>{q.value='';clr.hidden=true;run();q.focus()};
  q.addEventListener('keydown',e=>{if(e.key==='Enter'){e.preventDefault();q.blur()}});
  q.setAttribute('enterkeyhint','search');
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition,mic=$('#mic');
  if(!SR)mic.style.display='none';else{let rec=null;mic.onclick=()=>{
    if(rec){rec.stop();return}
    rec=new SR();rec.lang='he-IL';rec.interimResults=true;rec.maxAlternatives=1;
    mic.classList.add('rec');q.placeholder='מקשיב... אפשר לדבר';
    rec.onresult=e=>{q.value=Array.from(e.results).map(r=>r[0].transcript).join(' ');clr.hidden=!q.value;run()};
    rec.onerror=()=>{};rec.onend=()=>{rec=null;mic.classList.remove('rec');q.placeholder='חפשו כמו שלקוח מדבר: נעלי ריצה לילדה, סנדל עמיד במים'};
    try{rec.start()}catch(err){rec=null;mic.classList.remove('rec')}}}
  document.querySelectorAll('.chip[data-t]').forEach(c=>c.onclick=()=>{tag=tag===c.dataset.t?null:c.dataset.t;viewSearch()});
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
  ${(()=>{const l=brandCat(b);return l.length?`<h3>בקטלוג (${l.length})</h3><div class="grid">${l.slice(0,60).map(catCard).join('')}</div>`:''})()}
  ${b.models?`<h3>דגמים</h3>${b.models.map(m=>`<div class="model"><b>${esc(m.name)}</b><div>${esc(m.audience)}</div></div>`).join('')}`:''}</div>`;
  $('#back').onclick=()=>history.back();
}
function viewSales(){
  view.innerHTML=`<div class="panel"><h2>ארבעת שלבי המכירה</h2>${P.stages.map((s,i)=>`<div class="stage"><div class="n">${i+1}</div><div><b>${s.name}</b> <span class="sub">${s.en}</span><div>${s.text}</div></div></div>`).join('')}<p class="hint">${P.newModel}</p></div>
  <div class="panel"><h2>עקרונות בסיס לאנשי השירות</h2><ul>${P.staff.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>
  <div class="panel"><h2>עקרונות בסיס חנויות</h2><ul>${P.store.map(x=>`<li>${esc(x)}</li>`).join('')}</ul></div>`;
}

const KIND={morning:'בוקר',evening:'ערב',other:'אחר'};
const DEVH='49f9a8de9117cee6db1894e052090e81f79a64f2debf552a48dd59beab6aca13';
let IS_DEV=false;
crypto.subtle.digest('SHA-256',new TextEncoder().encode((ME.email||'').toLowerCase())).then(b=>{IS_DEV=[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')===DEVH;if(IS_DEV)route()}).catch(()=>{});
const today=()=>new Date().toLocaleDateString('sv');
async function viewHR(){
  const sb=ME.sb;view.innerHTML='<div class="hint">טוען...</div>';
  const day=window.__hrDay||today();
  const [br,pp,sh]=await Promise.all([sb.from('sniff_branches').select('id,name,number,org_id,branch_type').order('name'),sb.from('sniff_people').select('*').eq('active',true).order('name'),sb.from('sniff_shifts').select('*').eq('day',day)]);
  let REL=[],MYREL=[];if(['hq','manager','area_manager','format_manager'].includes(ME.role)){for(const k of ['morning','evening','other']){const l=await sb.rpc('sniff_released',{p_day:day,p_kind:k});if(!l.error&&l.data)l.data.forEach(x=>REL.push(Object.assign({},x,{kind:k,person_id:x.person_id||x.id})))}
    const m=await sb.from('sniff_releases').select('person_id,kind').eq('day',day);if(!m.error&&m.data)MYREL=m.data}
  if(br.error||pp.error||sh.error){view.innerHTML='<div class="hint">שגיאה בטעינה, נסו שוב.</div>';return}
  pp.data.sort((x,y)=>x.name.localeCompare(y.name,'he'));br.data.sort((x,y)=>x.name.localeCompare(y.name,'he'));
  const can=['hq','manager','area_manager','format_manager'].includes(ME.role);
  const P={};pp.data.forEach(x=>P[x.id]=x);
  const st={planned:'',confirmed:' ✅',cant:' ❌ לא יכול',requested:' ⏳ בקשה'};
  const meP=pp.data.find(x=>x.user_id===ME.userId);
  const ALLP=new Map();pp.data.forEach(x=>ALLP.set(x.id,{id:x.id,name:x.name,branch_id:x.branch_id}));
  const BN={};br.data.forEach(y=>BN[y.id]=y.name);REL.forEach(x=>{if(x.branch_name)BN[x.branch_id]=x.branch_name});
  const otherBranches=b=>{const s=new Set();REL.forEach(x=>{if(x.branch_id!==b.id)s.add(x.branch_id)});return [...s].map(id=>({id,name:BN[id]||'סניף אחר'})).sort((x,y)=>x.name.localeCompare(y.name,'he'))};
  const pav=x=>x.avatar_url?`<img class="pav" src="${esc(x.avatar_url)}" alt="" referrerpolicy="no-referrer" onerror="this.style.display='none'">`:`<span class="pav pl">${esc((x.name||'?')[0])}</span>`;
  const contact=x=>`<span class="ppl">${pav(x)}<b>${esc(x.name)}</b>${x.emp_no?` <small>#${esc(x.emp_no)}</small>`:''}${x.title?` <small>${esc(x.title)}</small>`:''}${x.phone?` <a class="call" href="tel:${esc(x.phone)}">📞 ${esc(x.phone)}</a>`:''}${x.email?` <a class="call" href="mailto:${esc(x.email)}">✉️</a>`:''}</span>`;
  const KL={morning:'בוקר',evening:'ערב',other:'אחר'};
  const relUI=x=>`<div class="rel"><small>שחרור להשאלה ביום זה:</small> ${['morning','evening','other'].map(k=>{const r=MYREL.find(y=>y.person_id===x.id&&y.kind===k);return r?`<button class="chip pri" data-a="unrel" data-p="${x.id}" data-k2="${k}">שוחרר ל${KL[k]} ✕</button>`:`<button class="chip" data-a="rel" data-p="${x.id}" data-k2="${k}">שחרר ל${KL[k]}</button>`}).join('')}</div>`;
  const multi=br.data.length>1;
  view.innerHTML=(multi?`<div class="seg"><button class="chip" id="openall">פתח את כל הסניפים</button><button class="chip" id="closeall">סגור הכל</button></div>`:'')+`<div class="dayb ${day===today()?'':'warn'}"><span>📅 אתה עובד על יום:</span><input type="date" id="hrday" value="${day}">${day===today()?'<b>היום</b>':'<b>לא היום!</b> <button class="chip" id="dtoday">חזרה להיום</button>'}</div>`+br.data.map(b=>{
    const mine=pp.data.filter(x=>x.branch_id===b.id),s=sh.data.filter(x=>x.branch_id===b.id);
    const col=k=>{const l=s.filter(x=>x.kind===k);const reqBtn=(meP&&meP.branch_id===b.id&&k!=='other'&&!l.some(y=>y.person_id===meP.id))?`<button class="chip big" data-a="req" data-k="${k}" data-b="${b.id}">אני רוצה את המשמרת</button>`:'';
    return `<div class="shift"><b>${KIND[k]}</b> (${l.filter(y=>y.status!=='requested').length})${reqBtn}${l.length?l.map(x=>{const q=P[x.person_id];if(!q)return'';const me=q.user_id===ME.userId;return `<div class="row">${contact(q)}${q.branch_id!==b.id?' <span class="tag">מושאל מסניף אחר</span>':''}${x.note?` <span class="tag">${esc(x.note)}</span>`:''}${st[x.status]}${me&&x.status!=='requested'?` <button class="chip" data-a="ok" data-id="${x.id}">אני יכול</button><button class="chip" data-a="cant" data-id="${x.id}">לא יכול</button>`:''}${can&&x.status==='requested'?` <button class="chip pri" data-a="approve" data-id="${x.id}">אשר</button>`:''}${(can||(me&&x.status==='requested'))?` <button class="chip" data-a="del" data-id="${x.id}">${x.status==='requested'?(can?'דחה':'בטל בקשה'):'הסר'}</button>`:''}</div>`}).join(''):'<div class="hint">אין שיבוץ</div>'}</div>`};
    return `<div class="panel" data-bid="${b.id}"><h3 class="bh" data-bh="1">${esc(b.name)}${b.branch_type==='outlet'?' <span class="badge" style="background:var(--blue-soft);color:var(--blue)">אאוטלט</span>':''}${b.number?` · מס' ${esc(b.number)}`:''}${multi?` <small class="sub">· ${mine.length} עובדים · ${s.length} משובצים היום</small>`:''}${multi?'<span class="chev">▾</span>':''}</h3><div class="pbody" ${multi?'hidden':''}><div class="two">${col('morning')}${col('evening')}</div>${s.some(x=>x.kind==='other')?col('other'):''}
    ${can?`<div class="seg"><button class="chip big" data-m="shift">שיבוץ למשמרת</button><button class="chip big" data-m="new">עובד חדש</button><button class="chip big" data-m="staff">כל אנשי הצוות (${mine.length})</button></div>
    <div class="mode" data-mode="shift" data-bid="${b.id}" hidden>${mine.length?`<div class="hint">שיבוץ ליום <b>${esc(day.split("-").reverse().join("."))}</b> (אפשר לשנות את היום בראש המסך)</div>${otherBranches(b).length?`<label>מאיפה העובד<select class="lbr" data-b="${b.id}"><option value="">מהסניף הזה</option>${otherBranches(b).map(o=>`<option value="${o.id}">השאלה מסניף: ${esc(o.name)}</option>`).join('')}</select></label>`:''}<label>עובד<select class="psel">${mine.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('')}</select></label><div class="lbl">משמרת</div><div class="seg kseg"><button type="button" class="chip big pri" data-k="morning">בוקר</button><button type="button" class="chip big" data-k="evening">ערב</button><button type="button" class="chip big" data-k="other">אחר</button></div><input type="hidden" class="ksel" value="morning"><label class="onote" hidden>פירוט המשמרת<input class="note" placeholder="למשל: משמרת מיוחדת, סגירת חג, 10:00-14:00"></label><button class="chip big pri" data-a="add" data-b="${b.id}">שמור שיבוץ</button>`:'<div class="hint">עוד אין עובדים בסניף. קודם יש להוסיף עובד חדש.</div><button class="chip big" data-m="new" data-go="1">הוספת עובד חדש</button>'}</div>
    <div class="mode" data-mode="new" hidden><label>שם<input class="nm"></label><label>טלפון<input class="ph" inputmode="tel"></label><label>מייל (לכניסה עם גוגל)<input class="em" inputmode="email"></label><label>תפקיד<input class="tt"></label><label>מספר עובד<input class="eno" inputmode="numeric"></label><button class="chip big pri" data-a="newp" data-b="${b.id}">שמור עובד</button></div>`:''}
    <div class="mode" data-mode="staff" ${can?"hidden":""}>${mine.map(x=>`<div class="row">${contact(x)}${can?` <button class="chip" data-e="${x.id}">עריכה</button>`:''}${can?relUI(x):''}${can?`<div class="mode edit" data-eid="${x.id}" hidden><label>שם<input class="en" value="${esc(x.name)}"></label><label>טלפון<input class="ep" inputmode="tel" value="${esc(x.phone||'')}"></label><label>מייל<input class="ee" inputmode="email" value="${esc(x.email||'')}"></label><label>תפקיד<input class="et" value="${esc(x.title||'')}"></label><label>מספר עובד<input class="eeno" inputmode="numeric" value="${esc(x.emp_no||'')}"></label><button class="chip big pri" data-a="saveedit" data-id="${x.id}">שמור שינויים</button><button class="chip" data-a="rmp" data-id="${x.id}">הסר מהצוות</button></div>`:''}</div>`).join('')||'<div class="hint">עוד לא נוספו עובדים</div>'}</div></div></div>`}).join('')||'<div class="hint">אין סניפים להצגה</div>';
  if(ME.role==='hq'){view.insertAdjacentHTML('beforeend',`<div class="panel"><h3>סניף חדש</h3><div class="mode"><label>שם הסניף<input id="nbn"></label><label>מספר סניף<input id="nbno" inputmode="numeric"></label><div class="lbl">סוג סניף</div><div class="seg kseg"><button type="button" class="chip big pri" data-bt="regular">רגיל</button><button type="button" class="chip big" data-bt="outlet">אאוטלט</button></div><input type="hidden" id="nbt" value="regular"><button class="chip big pri" id="nbsave">שמור סניף</button></div></div>`);
    view.querySelectorAll('button[data-bt]').forEach(b=>b.onclick=()=>{$('#nbt').value=b.dataset.bt;view.querySelectorAll('button[data-bt]').forEach(x=>x.classList.toggle('pri',x===b))});
    $('#nbsave').onclick=async()=>{const n=$('#nbn').value.trim();if(!n)return;const org=(br.data[0]||{}).org_id;if(!org)return alert('אין ארגון');const r=await sb.from('sniff_branches').insert({org_id:org,name:n,number:$('#nbno').value.trim()||null,branch_type:$('#nbt').value});if(r.error)return alert('שגיאה: '+r.error.message);viewHR()}}
  if(IS_DEV)view.insertAdjacentHTML('afterbegin','<div class="hint">🛠 מצב מפתח: <a class="call" href="#/cal">🗓 לוח שבועי / חודשי (ניסוי)</a></div>');
  if(can){(async()=>{
    const box=document.createElement('div');box.className='panel';box.id='reqbox';view.prepend(box);
    const rq=await sb.from('sniff_staff_requests').select('*,sniff_branches(name)').eq('status','open').order('day');
    const myIds=new Set(br.data.map(x=>x.id));
    const KLx={morning:'בוקר',evening:'ערב',other:'אחר'};
    const dt=d=>String(d).split('-').reverse().join('.');
    let h='<h3>בקשות עזרה בעובדים</h3><button class="chip big pri" id="reqnew">בקשת עובד</button><div class="mode" id="reqform" hidden><label>סניף<select id="rqb">'+br.data.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('')+'</select></label><label>יום<input type="date" id="rqd" value="'+day+'"></label><div class="lbl">משמרת</div><div class="seg kseg"><button type="button" class="chip big pri" data-rk="morning">בוקר</button><button type="button" class="chip big" data-rk="evening">ערב</button><button type="button" class="chip big" data-rk="other">אחר</button></div><input type="hidden" id="rqk" value="morning"><label>הערה<input id="rqn" placeholder="למשל: צהריים, 12:00-16:00"></label><button class="chip big pri" id="rqsave">פרסם בקשה</button></div>';
    const list=rq.error?[]:(rq.data||[]);
    h+=list.length?list.map(q=>{const mineReq=myIds.has(q.branch_id);const bn=(q.sniff_branches&&q.sniff_branches.name)||BN[q.branch_id]||'סניף אחר';
      return `<div class="row" data-q="${q.id}"><b>${esc(bn)}</b> צריך עובד · ${dt(q.day)} · ${KLx[q.kind]||''}${q.note?' · '+esc(q.note):''}<div class="qact" data-mine="${mineReq?1:''}"></div></div>`}).join(''):'<div class="hint">אין בקשות פתוחות</div>';
    box.innerHTML=h;
    box.querySelector('#reqnew').onclick=()=>{const f=box.querySelector('#reqform');f.hidden=!f.hidden};
    box.querySelectorAll('button[data-rk]').forEach(b=>b.onclick=()=>{box.querySelector('#rqk').value=b.dataset.rk;box.querySelectorAll('button[data-rk]').forEach(x=>x.classList.toggle('pri',x===b))});
    box.querySelector('#rqsave').onclick=async()=>{const r=await sb.from('sniff_staff_requests').insert({branch_id:box.querySelector('#rqb').value,day:box.querySelector('#rqd').value,kind:box.querySelector('#rqk').value,note:box.querySelector('#rqn').value.trim()||null});if(r.error)return alert('לא הצליח: '+r.error.message);viewHR()};
    for(const row of box.querySelectorAll('.row[data-q]')){const q=list.find(x=>x.id===row.dataset.q),act=row.querySelector('.qact');let html='';
      if(act.dataset.mine){const o=await sb.rpc('sniff_request_offers',{p_request:q.id});const offs=o.error?[]:(o.data||[]);
        html+=offs.length?'<div class="hint">הוצעו:</div>'+offs.map(x=>`<div>${esc(x.name||x.person_name||'')}${x.branch_name?' · '+esc(x.branch_name):''} <button class="chip pri" data-pick="${x.person_id||x.id}">בחר</button></div>`).join(''):'<div class="hint">עוד לא הוצעו עובדים</div>'}
      const cand=pp.data.filter(x=>x.branch_id!==q.branch_id);
      html+=cand.length?`<div class="offer"><select class="qsel">${cand.map(x=>`<option value="${x.id}">${esc(x.name)}${BN[x.branch_id]?' · '+esc(BN[x.branch_id]):''}</option>`).join('')}</select> <button class="chip pri" data-offer="1">הצע עובד לבקשה</button></div>`:'';
      act.innerHTML=html;
      act.querySelectorAll('button[data-pick]').forEach(b=>b.onclick=async()=>{const r=await sb.rpc('sniff_fill_request',{p_request:q.id,p_person:b.dataset.pick});if(r.error)return alert('לא הצליח: '+r.error.message);viewHR()});
      const ob=act.querySelector('[data-offer]');if(ob)ob.onclick=async()=>{const r=await sb.rpc('sniff_offer_for_request',{p_request:q.id,p_person:act.querySelector('.qsel').value});if(r.error)return alert('לא הצליח: '+r.error.message);viewHR()}}
    const rows=[...box.querySelectorAll('.row[data-q]')];if(rows.length>4){rows.slice(4).forEach(r=>r.hidden=true);const more=document.createElement('button');more.className='chip big';more.textContent='הצג עוד '+(rows.length-4)+' בקשות';more.onclick=()=>{rows.forEach(r=>r.hidden=false);more.remove()};box.appendChild(more)}
  })()}
  view.querySelectorAll('button[data-m]').forEach(btn=>btn.onclick=()=>{const box=btn.closest('.panel');box.querySelectorAll('.mode').forEach(m=>m.hidden=m.dataset.mode!==btn.dataset.m);box.querySelectorAll('button[data-m]').forEach(x=>x.classList.toggle('pri',x===btn))});
  view.querySelectorAll('button[data-k]').forEach(b=>b.onclick=()=>{const m=b.closest('.mode');m.querySelector('.ksel').value=b.dataset.k;m.querySelectorAll('button[data-k]').forEach(x=>x.classList.toggle('pri',x===b));m.querySelector('.onote').hidden=b.dataset.k!=='other'});
  view.querySelectorAll('.panel').forEach(pn=>{const b=pn.querySelector('button[data-m]');if(b){const hasP=pn.querySelector('.psel');pn.querySelector(hasP?'button[data-m=shift]':'button[data-m=new]').click()}});
  const refill=m=>{const s=m.querySelector('select.lbr'),sel=m.querySelector('.psel'),bid=(s&&s.value)||(s?s.dataset.b:m.dataset.bid);const k=m.querySelector('.ksel').value;
    const busy=new Set(sh.data.filter(x=>x.kind===k&&x.status!=='cant'&&k!=='other').map(x=>x.person_id));
    const own=bid===m.dataset.bid;const l=(own?[...ALLP.values()].filter(x=>x.branch_id===bid&&!busy.has(x.id)):REL.filter(x=>x.branch_id===bid&&x.kind===k).map(x=>({id:x.person_id,name:x.name}))).sort((x,y)=>x.name.localeCompare(y.name,'he'));
    sel.innerHTML=l.map(x=>`<option value="${x.id}">${esc(x.name)}</option>`).join('')||'<option value="">'+(own?'אין עובדים פנויים למשמרת הזאת':'אין עובדים משוחררים למשמרת הזאת')+'</option>'};
  view.querySelectorAll('.mode[data-mode=shift]').forEach(m=>{const s=m.querySelector('select.lbr');if(s)s.onchange=()=>refill(m);m.querySelectorAll('button[data-k]').forEach(b=>b.addEventListener('click',()=>refill(m)));refill(m)});
  view.querySelectorAll('button[data-e]').forEach(b=>b.onclick=()=>{const f=view.querySelector('.edit[data-eid="'+b.dataset.e+'"]');f.hidden=!f.hidden});
  if(window.__hrOpen){const pn=view.querySelector('.panel[data-bid="'+window.__hrOpen+'"] .pbody');if(pn){pn.hidden=false;pn.parentElement.scrollIntoView()}window.__hrOpen=null}
  view.querySelectorAll('.bh').forEach(h=>h.onclick=()=>{const b=h.nextElementSibling;b.hidden=!b.hidden});
  if($('#openall')){$('#openall').onclick=()=>view.querySelectorAll('.pbody').forEach(b=>b.hidden=false);$('#closeall').onclick=()=>view.querySelectorAll('.pbody').forEach(b=>b.hidden=true)}
  if($('#dtoday'))$('#dtoday').onclick=()=>{window.__hrDay=today();viewHR()};
  $('#hrday').onchange=e=>{window.__hrDay=e.target.value;viewHR()};
  view.querySelectorAll('button[data-a]').forEach(btn=>btn.onclick=async()=>{
    const a=btn.dataset.a,box=btn.closest('.panel');let r;
    if(a==='rel')r=await sb.rpc('sniff_release_person',{p_person:btn.dataset.p,p_day:day,p_kind:btn.dataset.k2});
    else if(a==='unrel')r=await sb.rpc('sniff_unrelease_person',{p_person:btn.dataset.p,p_day:day,p_kind:btn.dataset.k2});
    else if(a==='del')r=await sb.from('sniff_shifts').delete().eq('id',btn.dataset.id);
    else if(a==='approve')r=await sb.from('sniff_shifts').update({status:'planned'}).eq('id',btn.dataset.id);
    else if(a==='req'){r=await sb.from('sniff_shifts').insert({branch_id:btn.dataset.b,person_id:meP.id,day,kind:btn.dataset.k,status:'requested'})}
    else if(a==='ok'||a==='cant')r=await sb.from('sniff_shifts').update({status:a==='ok'?'confirmed':'cant'}).eq('id',btn.dataset.id);
    else if(a==='add'){const pid=box.querySelector('.psel').value;if(!pid)return alert('אין עובד לשיבוץ');r=await sb.from('sniff_shifts').insert({branch_id:btn.dataset.b,person_id:pid,day,kind:box.querySelector('.ksel').value,note:box.querySelector('.ksel').value==='other'?(box.querySelector('.note').value.trim()||null):null})}
    else if(a==='saveedit'){const f=btn.closest('.edit');const n=f.querySelector('.en').value.trim();if(!n)return;r=await sb.from('sniff_people').update({name:n,phone:f.querySelector('.ep').value.trim()||null,email:f.querySelector('.ee').value.trim().toLowerCase()||null,title:f.querySelector('.et').value.trim()||null,emp_no:f.querySelector('.eeno').value.trim()||null}).eq('id',btn.dataset.id)}
    else if(a==='rmp'){if(!confirm('להסיר את העובד מהצוות? הוא יוסתר מהרשימה והמשמרות.'))return;r=await sb.from('sniff_people').update({active:false}).eq('id',btn.dataset.id)}
    else if(a==='newp'){const n=box.querySelector('.nm').value.trim();if(!n)return;const org=br.data.find(x=>x.id===btn.dataset.b).org_id;r=await sb.from('sniff_people').insert({org_id:org,branch_id:btn.dataset.b,name:n,phone:box.querySelector('.ph').value.trim()||null,email:box.querySelector('.em').value.trim().toLowerCase()||null,title:box.querySelector('.tt').value.trim()||null,emp_no:box.querySelector('.eno').value.trim()||null})}
    if(r&&r.error)alert('לא הצליח: '+r.error.message);else viewHR();
  });
}
function bind(){document.querySelectorAll('.card[data-b]').forEach(c=>c.onclick=()=>{location.hash='#/brand/'+c.dataset.b})}

// ===== לוח שבועי/חודשי (ניסוי, לקריאה בלבד) =====
window.__cal=window.__cal||{mode:'week',anchor:null,branch:null};
const iso=d=>d.toLocaleDateString('sv');
const addD=(d,n)=>{const x=new Date(d);x.setDate(x.getDate()+n);return x};
async function viewCal(){
  if(!IS_DEV){view.innerHTML='<div class="hint">המסך הזה פתוח רק למפתח.</div>';return}
  const sb=ME.sb,C=window.__cal;if(!C.anchor)C.anchor=iso(new Date());
  view.innerHTML='<div class="hint">טוען...</div>';
  const a=new Date(C.anchor+'T12:00:00');let from,to;
  if(C.mode==='day'){from=a;to=a}
  else if(C.mode==='week'){from=addD(a,-a.getDay());to=addD(from,6)}
  else{from=new Date(a.getFullYear(),a.getMonth(),1,12);to=new Date(a.getFullYear(),a.getMonth()+1,0,12)}
  const [br,pp,sh]=await Promise.all([sb.from('sniff_branches').select('id,name,branch_type').order('name'),sb.from('sniff_people').select('id,name,branch_id,active').order('name'),sb.from('sniff_shifts').select('*').gte('day',iso(from)).lte('day',iso(to))]);
  if(br.error||pp.error||sh.error){view.innerHTML='<div class="hint">שגיאה בטעינה.</div>';return}
  br.data.sort((x,y)=>x.name.localeCompare(y.name,'he'));
  if(!C.branch||!br.data.some(b=>b.id===C.branch))C.branch=(br.data[0]||{}).id;
  const bid=C.branch,P={};pp.data.forEach(x=>P[x.id]=x);
  const S=sh.data.filter(x=>x.branch_id===bid&&x.status!=='cant');
  const days=[];for(let d=new Date(from);d<=to;d=addD(d,1))days.push(iso(d));
  const HD=['א','ב','ג','ד','ה','ו','ש'];
  const mark=(k,st)=>({morning:'☀️',evening:'🌙',other:'✱'}[k]||'')+(st==='requested'?'⏳':'');
  const title=C.mode==='month'?a.toLocaleDateString('he-IL',{month:'long',year:'numeric'}):C.mode==='week'?from.toLocaleDateString('he-IL',{day:'numeric',month:'short'})+' – '+to.toLocaleDateString('he-IL',{day:'numeric',month:'short'}):a.toLocaleDateString('he-IL',{weekday:'long',day:'numeric',month:'long'});
  let body='';
  const fn=id=>{const q=P[id];return q?esc(q.name.split(' ')[0]):''};
  const half=(d,k)=>{const l=S.filter(x=>x.day===d&&x.kind===k);return `<div class="hf ${l.length?'':'empty'}"><i>${k==='morning'?'☀️':'🌙'}</i>${l.map(x=>`<span>${fn(x.person_id)}${x.status==='requested'?'⏳':''}</span>`).join('')}</div>`};
  if(C.mode==='month'){
    body='<div class="calgrid month">'+HD.map(h=>`<div class="ch">${h}</div>`).join('')+Array(from.getDay()).fill('<div></div>').join('')+days.map(d=>{const l=S.filter(x=>x.day===d);const m=l.filter(x=>x.kind==='morning').length,e=l.filter(x=>x.kind==='evening').length;return `<div class="cd ${d===iso(new Date())?'today':''}" data-d="${d}"><b>${+d.slice(8)}</b>${m?`<div>☀️${m}</div>`:''}${e?`<div>🌙${e}</div>`:''}</div>`}).join('')+'</div>'
  }else{
    const cols=C.mode==='day'?1:7;
    body=`<div class="calgrid wk ${C.mode}">`+(C.mode==='week'?HD.map(h=>`<div class="ch">${h}</div>`).join(''):'')+days.map(d=>`<div class="cd wd ${d===iso(new Date())?'today':''}" data-d="${d}" data-go="1"><b>${C.mode==='day'?d.split('-').reverse().join('.'):+d.slice(8)}</b><div class="two2">${half(d,'morning')}${half(d,'evening')}</div></div>`).join('')+'</div><div class="hint">☀️ בוקר · 🌙 ערב · ⏳ בקשה. נגיעה ביום עוברת למסך השיבוץ של אותו יום.</div>'
  }
  view.innerHTML=`<div class="panel"><h2>לוח משמרות <small class="sub">(ניסוי)</small></h2>${br.data.length>1?`<label>סניף<select id="calb">${br.data.map(b=>`<option value="${b.id}" ${b.id===bid?'selected':''}>${esc(b.name)}</option>`).join('')}</select></label>`:''}<div class="seg"><button class="chip ${C.mode==='day'?'pri':''}" data-cm="day">יום</button><button class="chip ${C.mode==='week'?'pri':''}" data-cm="week">שבוע</button><button class="chip ${C.mode==='month'?'pri':''}" data-cm="month">חודש</button></div><div class="seg"><button class="chip" id="calp">→ הקודם</button><button class="chip" id="calt">היום</button><button class="chip" id="caln">הבא ←</button></div><h3>${esc(title)}</h3>${body}<p><a class="call" href="#/hr">חזרה לכוח אדם</a></p></div>`;
  const step=n=>{const x=new Date(C.anchor+'T12:00:00');if(C.mode==='month')x.setMonth(x.getMonth()+n);else x.setDate(x.getDate()+n*(C.mode==='week'?7:1));C.anchor=iso(x);viewCal()};
  $('#calp').onclick=()=>step(-1);$('#caln').onclick=()=>step(1);$('#calt').onclick=()=>{C.anchor=iso(new Date());viewCal()};
  view.querySelectorAll('button[data-cm]').forEach(b=>b.onclick=()=>{C.mode=b.dataset.cm;viewCal()});
  if($('#calb'))$('#calb').onchange=e=>{C.branch=e.target.value;viewCal()};
  view.querySelectorAll('[data-d]').forEach(c=>c.onclick=()=>{if(c.dataset.go||C.mode==='month'){window.__hrDay=c.dataset.d;window.__hrOpen=C.branch;location.hash='#/hr'}else{C.anchor=c.dataset.d;viewCal()}});
}
function route(){
  const h=location.hash;
  if(h.startsWith('#/brand/'))return viewBrand(h.slice(8));
  const t=h.replace('#/','')||'search';
  document.querySelectorAll('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===t));
  ({search:viewSearch,brands:viewSearch,sales:viewSales,hr:viewHR,cal:viewCal}[t]||viewSearch)();
}
document.querySelectorAll('#tabs button').forEach(b=>b.onclick=()=>{location.hash='#/'+b.dataset.t});
window.addEventListener('hashchange',route);route();
let dip=null;window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();dip=e;$('#install').style.display='inline-block'});
$('#install').onclick=async()=>{if(dip){dip.prompt();await dip.userChoice;dip=null;$('#install').style.display='none'}};
if(/iphone|ipad/i.test(navigator.userAgent)&&!navigator.standalone){const i=$('#install');i.style.display='inline-block';i.onclick=()=>alert('בספארי: כפתור השיתוף ואז "הוספה למסך הבית"')}
if('serviceWorker' in navigator){const had=!!navigator.serviceWorker.controller;navigator.serviceWorker.addEventListener('controllerchange',()=>{if(had&&!window.__rl){window.__rl=1;location.reload()}});navigator.serviceWorker.register('sw.js').then(r=>r.update()).catch(()=>{})}
};
