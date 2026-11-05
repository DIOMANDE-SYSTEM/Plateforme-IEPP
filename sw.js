/* Plateforme IEPP v1.3 — Service Worker : ouverture de l'application SANS Internet.
   - Page (index.html) : on essaie le réseau, et à défaut on sert la dernière copie conservée.
   - Fichiers du site (même domaine) : copie conservée, mise à jour en arrière-plan.
   - Supabase, polices, CDN et tout autre domaine : jamais interceptés (ils échouent proprement hors ligne,
     l'application fonctionne alors avec les données de l'appareil). */
const CACHE = 'iepp-offline-v13';
const CORE = ['./', './index.html', './manifest.json'];

self.addEventListener('install', function(e){
  e.waitUntil(
    caches.open(CACHE).then(function(c){
      return Promise.all(CORE.map(function(u){ return c.add(new Request(u, {cache:'reload'})).catch(function(){}); }));
    }).then(function(){ return self.skipWaiting(); })
  );
});

self.addEventListener('activate', function(e){
  e.waitUntil(
    caches.keys().then(function(keys){
      return Promise.all(keys.filter(function(k){ return k !== CACHE && /^iepp-offline-/.test(k); }).map(function(k){ return caches.delete(k); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(e){
  var req = e.request;
  if (req.method !== 'GET') return;
  var url = new URL(req.url);
  if (url.origin !== self.location.origin) return;           /* Supabase, CDN, polices : on ne touche pas */
  if (/\/sw\.js$/.test(url.pathname)) return;

  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function(res){
        var copy = res.clone();
        caches.open(CACHE).then(function(c){ c.put('./index.html', copy); });
        return res;
      }).catch(function(){
        return caches.match('./index.html').then(function(r){ return r || caches.match('./'); });
      })
    );
    return;
  }
  e.respondWith(
    caches.match(req).then(function(hit){
      var net = fetch(req).then(function(res){
        if (res && res.ok){ var copy = res.clone(); caches.open(CACHE).then(function(c){ c.put(req, copy); }); }
        return res;
      }).catch(function(){ return hit; });
      return hit || net;
    })
  );
});
