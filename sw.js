const CACHE='quad-quest-v1';
// The shared shell is followed by this chapter's geometry-specific visual layer.
const ASSETS=['./','./index.html','./css/style.css','./js/app.js','./js/dom.js','./js/content.js','./js/state.js','./js/math.js','./js/effects.js','./js/visuals.js','./js/puzzles.js','./js/labs.js','./manifest.webmanifest','./icons/icon.svg','./icons/icon-192.png','./icons/icon-512.png'];
ASSETS.push('./css/geometry.css');
self.addEventListener('install',event=>event.waitUntil(caches.open(CACHE).then(cache=>cache.addAll(ASSETS)).then(()=>self.skipWaiting())));
self.addEventListener('activate',event=>event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k.startsWith('quad-quest-')&&k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
self.addEventListener('fetch',event=>{
  const url=new URL(event.request.url);
  if(event.request.method!=='GET'||url.origin!==self.location.origin||!url.href.startsWith(self.registration.scope))return;
  // A versioned, complete cache keeps all modules from the same release together.
  event.respondWith(caches.open(CACHE).then(async cache=>{
    const cached=await cache.match(event.request);if(cached)return cached;
    try{return await fetch(event.request);}catch{return event.request.mode==='navigate'?cache.match('./index.html'):Response.error();}
  }));
});
