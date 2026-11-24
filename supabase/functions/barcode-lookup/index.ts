// סניף: זיהוי ברקוד לפי דרישה. בקשה רגילה אחת לאתר WeShoes לכל ברקוד חדש (חיפוש). המידה מוזנת ידנית. לא איסוף המוני.
// נדרש משתמש מחובר (verify_jwt). מחזיר את שם הדגם בלבד.
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
    let handle:string|null=null,vendor:string|null=null,ptitle:string|null=null;
    const s=await get(`${BASE}/search/suggest.json?q=${code}&resources[type]=product&resources[limit]=3`);
    if(s.status===429||s.status===403)return out({found:false,reason:'blocked'});
    if(s.ok){const j=await s.json().catch(()=>null);const p=j?.resources?.results?.products?.[0];if(p?.handle){handle=p.handle;vendor=p.vendor||null;ptitle=p.title||null}else if(p?.url){const m=String(p.url).match(/\/products\/([^?\/]+)/);if(m)handle=m[1]}}
    if(!handle){const h=await get(`${BASE}/search?q=${code}&type=product`);if(h.status===429||h.status===403)return out({found:false,reason:'blocked'});if(h.ok){const t=await h.text();const m=t.match(/\/products\/([a-zA-Z0-9%\-_֐-׿]+)/);if(m)handle=m[1]}}
    if(!handle)return out({found:false,reason:'no_result'});
    return out({found:true,handle,vendor:vendor,title:ptitle});
  }catch(e){return out({found:false,reason:'error',message:String(e)})}
});
