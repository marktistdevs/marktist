// sw.js - Service Worker for MARKTIST Beta Testing

const CACHE_NAME = 'marktist-beta-v1';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/styles.css',
  '/script.js',
  '/test-beta-1.0/Fonts/CD/ClashDisplay-Regular.otf',
  '/Fonts/CD/ClashDisplay-Medium.otf',
  '/test-beta-1.0/Fonts/CD/ClashDisplay-Semibold.otf',
  '/test-beta-1.0/Fonts/CD/ClashDisplay-Bold.otf',
  '/test-beta-1.0/Fonts/CD/ClashDisplay-Light.otf',
  '/test-beta-1.0/Fonts/CD/ClashDisplay-Extralight.otf',
  '/test-beta-1.0/Fonts/LS/LeagueSpartan-Thin.ttf',
  '/test-beta-1.0/Fonts/LS/LeagueSpartan-ExtraLight.ttf',
  '/test-beta-1.0/Fonts/LS/LeagueSpartan-Light.ttf',
  '/test-beta-1.0/Fonts/LS/LeagueSpartan-Regular.ttf',
  '/test-beta-1.0/Fonts/LS/LeagueSpartan-Medium.ttf',
  '/test-beta-1.0/Fonts/LS/LeagueSpartan-SemiBold.ttf',
  '/test-beta-1.0/Fonts/LS/LeagueSpartan-Bold.ttf',
  '/test-beta-1.0/Fonts/LS/LeagueSpartan-ExtraBold.ttf',
  '/test-beta-1.0/Fonts/LS/LeagueSpartan-Black.ttf',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css'
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
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request).then(fetchRes => {
        // Optionally cache new requests
        return fetchRes;
      });
    }).catch(() => {
      // Fallback: return offline page or nothing
      if (event.request.destination === 'document') {
        return caches.match('/index.html');
      }
    })
  );
});
