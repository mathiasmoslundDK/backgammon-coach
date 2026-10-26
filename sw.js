const CACHE='bgc-977790d0';
const CORE=['./','index.html','manifest.webmanifest','icon-180.png','icon-192.png','icon-512.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(CORE.map(u=>new Request(u,{cache:'reload'})))).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(ks=>Promise.all(ks.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
// The app page: try the network first (fresh version), fall back to the saved copy after 3 s or when offline.
function page(req){
  const net=fetch(new Request(req.url,{cache:'no-store'})).then(res=>{if(res.ok){const cp=res.clone();caches.open(CACHE).then(c=>{c.put('./',cp.clone());c.put('index.html',cp)})}return res});
  const saved=()=>caches.match('./').then(h=>h||caches.match('index.html'));
  const timeout=new Promise(r=>setTimeout(r,3000)).then(saved);
  return Promise.race([net.catch(saved),timeout.then(h=>h||net)]).then(r=>r||net);
}
self.addEventListener('fetch',e=>{const r=e.request;if(r.method!=='GET')return;
  const u=new URL(r.url);
  if(r.mode==='navigate'||(u.origin===location.origin&&/\/(index\.html)?$/.test(u.pathname))){e.respondWith(page(r));return}
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>{
    const net=fetch(r).then(res=>{if(res&&(res.ok||res.type==='opaque')){const cp=res.clone();caches.open(CACHE).then(c=>c.put(r,cp))}return res}).catch(()=>hit);
    return hit||net;}))});
