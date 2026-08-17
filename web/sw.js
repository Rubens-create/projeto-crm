const CACHE_NAME = 'zygg-limpeza-v7';
const ASSETS_TO_CACHE = [
  '/prestador',
  '/static.css',
  '/provider.js',
  '/manifest.json',
  '/assets/loft.jpg',
  '/assets/bedroom.jpg',
  '/assets/studio.jpg',
  '/assets/penthouse.jpg'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => {
      return Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
