// NABTAsmart - kill switch (application temporairement suspendue)
// Ce service worker supprime toutes les copies en cache sur l'appareil,
// se désinstalle, puis recharge les pages ouvertes pour afficher
// le message d'indisponibilité.
// Pour restaurer l'application : revenir au commit a431d9f.

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(keys.map(k => caches.delete(k)));
    await self.clients.claim();
    await self.registration.unregister();
    const clients = await self.clients.matchAll({ type: 'window' });
    clients.forEach(c => c.navigate(c.url));
  })());
});

// Plus aucune réponse depuis le cache : tout passe par le réseau.
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(fetch(e.request, { cache: 'no-store' }));
});
