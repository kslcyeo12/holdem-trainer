const CACHE='holdem-trainer-v14';
const ASSETS=['./','./index.html','./style.css','./css1.css','./css2.css','./css3.css','./css4.css','./css5.css','./css6.css','./css7.css','./css8.css','./app.js','./app1.js','./app2.js','./app3.js','./app4.js','./app5.js','./app6.js','./app7.js','./app8.js','./app9.js','./app15.js','./app16.js','./manifest.webmanifest','./icon.svg'];
self.addEventListener('install',e=>{self.skipWaiting();e.waitUntil(caches.open(CACHE).then(c=>c.addAll(ASSETS)))});
self.addEventListener('activate',e=>e.waitUntil(Promise.all([caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))),self.clients.claim()])));
self.addEventListener('fetch',e=>{if(e.request.method!=='GET')return;e.respondWith(fetch(e.request).then(resp=>{const copy=resp.clone();caches.open(CACHE).then(c=>c.put(e.request,copy));return resp}).catch(()=>caches.match(e.request).then(r=>r||caches.match('./index.html'))))});
