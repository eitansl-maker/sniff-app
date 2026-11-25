const V='sniff-3.54';
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(V).then(c=>c.addAll(['./','index.html','app.js','config.js','auth.js','icons/icon.svg'])))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==V).map(x=>caches.delete(x)))))});
self.addEventListener('fetch',e=>{if(e.request.method!=='GET'||new URL(e.request.url).origin!==location.origin)return;e.respondWith(fetch(e.request.url,{cache:'no-store'}).then(r=>{const c=r.clone();caches.open(V).then(ch=>ch.put(e.request,c));return r}).catch(()=>caches.match(e.request)))});
