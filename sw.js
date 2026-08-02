/* Service Worker minimal — requis pour l'installation Android/PWA.
   Stratégie : network-first, avec repli sur le cache hors-ligne. */
const CACHE = 'iepp-v1';
const CORE = ['./', './index.html', './manifest.webmanifest',
              './icon-192.png', './icon-512.png'];

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE).then((c) => c.addAll(CORE)).catch(()=>{}));
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(caches.keys().then((ks) =>
    Promise.all(ks.filter((k) => k !== CACHE).map((k) => caches.delete(k)))));
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;                 // ne pas intercepter les écritures
  e.respondWith(
    fetch(req).then((res) => {
      const copy = res.clone();
      caches.open(CACHE).then((c) => c.put(req, copy)).catch(()=>{});
      return res;
    }).catch(() => caches.match(req).then((r) => r || caches.match('./index.html')))
  );
});
