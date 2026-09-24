const CACHE_NAME = 'zygg-limpeza-v9';
const ASSETS_TO_CACHE = [
  '/prestador',
  '/static.css',
  '/provider.js',
  '/provider-navigation.js',
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
  const url = new URL(event.request.url);
  const refreshFromNetwork = event.request.mode === 'navigate' || [
    '/static.css',
    '/provider.js',
    '/provider-navigation.js',
    '/provider-settings.js',
    '/provider-settings.html',
    '/i18n.js'
  ].includes(url.pathname);

  if (refreshFromNetwork) {
    event.respondWith(fetch(event.request).then(response => {
      if (response.ok && url.origin === self.location.origin) {
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
      }
      return response;
    }).catch(async () => (await caches.match(event.request)) || Response.error()));
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
