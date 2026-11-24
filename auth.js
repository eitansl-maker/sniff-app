// כניסה עם גוגל + טעינת המידע מהמאגר המוגן. בלי הרשאה אין שום מידע.
(function(){
const C=window.SNIFF_CONFIG,$=s=>document.querySelector(s);
const sb=window.supabase.createClient(C.supabaseUrl,C.supabaseKey,{auth:{persistSession:true,detectSessionInUrl:true}});
const gate=$('#gate');
function show(html){gate.hidden=false;$('#view').innerHTML='';gate.innerHTML=html}
function loginScreen(msg){
  show(`<div class="panel gate"><h2>ברוכים הבאים</h2><p>${msg||'הכניסה לעובדים שאושרו מראש בלבד.'}</p><button class="chip big" id="gbtn">כניסה עם Google</button></div>`);
  $('#gbtn').onclick=()=>sb.auth.signInWithOAuth({provider:'google',options:{redirectTo:location.origin+location.pathname,queryParams:{prompt:'select_account'}}});
}
function deniedScreen(email){
  show(`<div class="panel gate"><h2>אין הרשאה</h2><p>המייל ${email.replace(/[<&]/g,'')} עדיין לא ברשימת העובדים. יש לבקש מהמנהלת להוסיף אותו.</p><button class="chip" id="lo">התחברות עם חשבון אחר</button></div>`);
  $('#lo').onclick=async()=>{try{await sb.auth.signOut({scope:'local'})}catch(e){}try{Object.keys(localStorage).filter(k=>k.startsWith('sb-')).forEach(k=>localStorage.removeItem(k))}catch(e){}location.replace(location.pathname)};
}
async function start(){
  const {data:{session}}=await sb.auth.getSession();
  if(!session)return loginScreen();
  const u=session.user;
  await sb.rpc('sniff_claim_invite');
  try{await sb.rpc('sniff_touch',{p_avatar:(u.user_metadata&&(u.user_metadata.avatar_url||u.user_metadata.picture))||null})}catch(e){}
  const {data:mem}=await sb.from('sniff_members').select('role,title,display_name,org_id,branch_id,sniff_orgs(name),sniff_branches(name,number,branch_type)').eq('user_id',u.id).maybeSingle();
  if(!mem)return deniedScreen(u.email||'');
  const [br,pr]=await Promise.all([
    sb.from('sniff_brands').select('slug,name,he_name,origin,status,type,audience,points,tags,sort,sniff_models(name,audience,tags,sort)').order('sort'),
    sb.from('sniff_content').select('body').eq('kind','principles').maybeSingle()]);
  if(br.error)return loginScreen('שגיאה בטעינת המידע, נסו שוב.');
  const B=(br.data||[]).map(b=>({id:b.slug,name:b.name,he:b.he_name||b.name,origin:b.origin||'',status:b.status,type:b.type||'',audience:b.audience||'',points:b.points||[],tags:b.tags||[],
    models:(b.sniff_models||[]).sort((x,y)=>x.name.localeCompare(y.name,'he'))}));
  B.sort((x,y)=>x.he.localeCompare(y.he,'he'));
  B.forEach(b=>{if(!b.models.length)delete b.models});
  let CAT=[];
  try{for(let from=0;;from+=1000){const r=await sb.from('sniff_catalog').select('brand,model_code,title,product_type,tags,colors,price_min,price_max,regular_price_min,regular_price_max,outlet_price_min,outlet_price_max,outlet_available,available,image,url').order('brand').range(from,from+999);if(r.error||!r.data||!r.data.length)break;CAT=CAT.concat(r.data);if(r.data.length<1000)break}}catch(e){}
  const m=u.user_metadata||{};
  gate.hidden=true;
  window.SNIFF_BOOT(B,(pr.data&&pr.data.body)||{staff:[],store:[],stages:[],newModel:''},{
    email:u.email||'',
    name:mem.display_name||m.full_name||m.name||u.email,photo:m.avatar_url||m.picture||'',role:mem.role,title:mem.title,
    orgId:mem.org_id,orgName:mem.sniff_orgs&&mem.sniff_orgs.name,branchName:mem.sniff_branches&&mem.sniff_branches.name,branchNumber:mem.sniff_branches&&mem.sniff_branches.number,branchType:mem.sniff_branches&&mem.sniff_branches.branch_type,
    sb,catalog:CAT,userId:u.id,logout:async()=>{try{await sb.auth.signOut({scope:'local'})}catch(e){}try{Object.keys(localStorage).filter(k=>k.startsWith('sb-')).forEach(k=>localStorage.removeItem(k))}catch(e){}location.replace(location.pathname)}});
}
start();
})();
