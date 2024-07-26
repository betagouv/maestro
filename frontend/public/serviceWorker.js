// src/service-worker.js

import { precacheAndRoute } from 'workbox-precaching';

precacheAndRoute(self.__WB_MANIFEST);

self.addEventListener('install', (event) => {
  console.log('Service Worker installing.');
  // Ajoutez d'autres actions d'installation si nécessaire
});

self.addEventListener('fetch', (event) => {
  console.log('Service Worker fetching:', event.request.url);
  event.respondWith(
    caches.match(event.request).then((response) => {
      return response || fetch(event.request);
    })
  );
});
