/* Plateforme IEPP – Service Worker (2026.10.24-1)
   Objectif : hors connexion, le navigateur affiche SA page native « Aucun accès à Internet »
   (et jamais le contenu de manifest.json ou une page périmée).
   - Aucune réponse n'est fabriquée par le Service Worker : toutes les requêtes vont au réseau.
   - Les anciens caches (qui contenaient la mauvaise réponse) sont supprimés à l'activation.
   - Les données de l'utilisateur (localStorage, IndexedDB, Supabase) ne sont jamais touchées. */
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){
  e.waitUntil(
    (self.caches ? caches.keys().then(function(ks){ return Promise.all(ks.map(function(k){ return caches.delete(k); })); }) : Promise.resolve())
      .catch(function(){})
      .then(function(){ return self.clients.claim(); })
  );
});
self.addEventListener('message', function(e){ if (e.data === 'skipWaiting') self.skipWaiting(); });
/* Gestionnaire présent (installabilité PWA) mais volontairement passif : pas de respondWith -> réseau, ou page native hors connexion. */
self.addEventListener('fetch', function(){});
