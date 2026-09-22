import { clientsClaim } from 'workbox-core';

self.skipWaiting();
clientsClaim();

// Les versions précédentes mettaient en cache le shell, les assets et les GET
// de l'API pour un fonctionnement hors ligne. Ces caches restent dans le
// navigateur des postes déjà équipés tant qu'on ne les supprime pas.
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) =>
        Promise.all(cacheNames.map((cacheName) => caches.delete(cacheName)))
      )
  );
});
