/* Service Worker — IEPP TENGRELA
   Met l'application en cache pour un fonctionnement 100 % hors-ligne.
   Après la 1re ouverture (avec internet), l'appli fonctionne sans connexion. */
const CACHE = 'iepp-tengrela-v1';
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png'
];

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {})
  );
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

/* Stratégie « cache d'abord » : instantané et hors-ligne.
   Les requêtes réseau (ex. synchro cloud) restent possibles quand internet est là. */
self.addEventListener('fetch', (e) => {
  const req = e.request;
  if (req.method !== 'GET') return;
  e.respondWith(
    caches.match(req).then((cached) => {
      if (cached) return cached;
      return fetch(req).then((res) => {
        try {
          const copy = res.clone();
          caches.open(CACHE).then((c) => c.put(req, copy)).catch(() => {});
        } catch (err) {}
        return res;
      }).catch(() => cached);
    })
  );
});
