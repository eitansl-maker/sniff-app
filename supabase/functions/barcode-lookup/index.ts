// סניף: זיהוי ברקוד לפי דרישה. שתי בקשות רגילות לאתר WeShoes לכל ברקוד חדש (חיפוש + דף הדגם). לא איסוף המוני.
// נדרש משתמש מחובר (verify_jwt). מחזיר את הדגם וכל הווריאנטים שלו כדי שהאפליקציה תשמור אותם יחד.
const CORS={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type','Content-Type':'application/json'};
const H={'User-Agent':'Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Mobile Safari/537.36','Accept-Language':'he-IL,he;q=0.9,en;q=0.8','Accept':'application/json,text/html;q=0.9,*/*;q=0.8'};
const BASE='https://www.weshoes.co.il';
const out=(o:unknown,s=200)=>new Response(JSON.stringify(o),{status:s,headers:CORS});
async function get(u:string){const r=await fetch(u,{headers:H});return r}
Deno.serve(async(req)=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers:CORS});
  try{
    const {code:raw}=await req.json();const code=String(raw||'').replace(/\D/g,'');
    if(code.length<8||code.length>14)return out({found:false,reason:'bad_code'});
    // 1) חיפוש באתר
    let handle:string|null=null;
    const s=await get(`${BASE}/search/suggest.json?q=${code}&resources[type]=product&resources[limit]=3`);
    if(s.status===429||s.status===403)return out({found:false,reason:'blocked'});
    if(s.ok){const j=await s.json().catch(()=>null);const p=j?.resources?.results?.products?.[0];if(p?.handle)handle=p.handle;else if(p?.url){const m=String(p.url).match(/\/products\/([^?\/]+)/);if(m)handle=m[1]}}
    if(!handle){const h=await get(`${BASE}/search?q=${code}&type=product`);if(h.status===429||h.status===403)return out({found:false,reason:'blocked'});if(h.ok){const t=await h.text();const m=t.match(/\/products\/([a-zA-Z0-9%\-_֐-׿]+)/);if(m)handle=m[1]}}
    if(!handle)return out({found:false,reason:'no_result'});
    // 2) דף הדגם עם הברקודים
    const pr=await get(`${BASE}/products/${handle}.js`);
    if(pr.status===429||pr.status===403)return out({found:false,reason:'blocked'});
    if(!pr.ok)return out({found:false,reason:'no_product'});
    const p=await pr.json();
    const opts=(p.options||[]).map((o:any)=>typeof o==='string'?o:o.name);
    const iSize=Math.max(0,opts.findIndex((n:string)=>/מידה|size/i.test(n||'')));
    const iColor=opts.findIndex((n:string)=>/צבע|color|colour/i.test(n||''));
    const vars=(p.variants||[]).map((v:any)=>({barcode:v.barcode?String(v.barcode).replace(/\D/g,''):null,sku:v.sku||null,size:v['option'+(iSize+1)]||null,color:iColor>=0?(v['option'+(iColor+1)]||null):(v.option1||null),available:v.available}));
    const norm=(x:string|null)=>x?x.replace(/^0+/,''):'';
    const hit=vars.find((v:any)=>norm(v.barcode)===norm(code));
    return out({found:!!hit,reason:hit?'ok':'code_not_in_product',handle,vendor:p.vendor,title:p.title,matched:hit||null,variants:vars.filter((v:any)=>v.barcode)});
  }catch(e){return out({found:false,reason:'error',message:String(e)})}
});
