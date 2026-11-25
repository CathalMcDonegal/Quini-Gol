const C='qg17';
const CORE=['./','index.html','manifest.json','icon-192.svg','icon-512.svg','mark.svg'];
self.addEventListener('install',e=>{
  e.waitUntil(caches.open(C).then(c=>c.addAll(CORE)));
  self.skipWaiting();
});
self.addEventListener('activate',e=>{
  e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==C).map(k=>caches.delete(k)))).then(()=>self.clients.claim()));
});
self.addEventListener('fetch',e=>{
  const u=new URL(e.request.url);
  if(u.origin!==location.origin)return;
  const data=u.pathname.includes('/data/');
  const page=e.request.mode==='navigate'||u.pathname.endsWith('/index.html')||u.pathname.endsWith('/');
  if(data||page){
    e.respondWith(fetch(e.request,{cache:'no-store'}).then(r=>{
      if(r&&r.ok){const copy=r.clone();caches.open(C).then(c=>c.put(e.request,copy));}
      return r;
    }).catch(()=>caches.match(e.request).then(r=>r||Response.error())));
  }else{
    e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(net=>{
      if(net&&net.ok){const copy=net.clone();caches.open(C).then(c=>c.put(e.request,copy));}
      return net;
    })));
  }
});
