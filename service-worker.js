/**
 * Service Worker for 5. Sınıf Maarif İngilizce PWA
 * Caches core assets for offline usage on mobile and desktop
 */

const CACHE_NAME = 'learnish-e161e6e0';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './app.css',
  './app.js',
  './curriculum-data.js',
  './words-data.js',
  './manifest.json',
  './favicon.png',
  './icon-192.png',
  './icon-512.png',
  './assets/mentor-rest.png',
  './assets/mentor-blink.png',
  './assets/mentor-smile.png',
  './assets/mentor-talk.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Network-first: güncel kod her zaman önce sunucudan alınır (mobilde eski app.js takılı kalmasın),
// çevrimdışıyken önbellekteki sürüm kullanılır.
// Sayfa "Şimdi Güncelle" butonuna basınca SKIP_WAITING mesajı gönderir;
// SW bunu alınca beklemeyi atlayıp hemen aktif hale geçer.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;

  event.respondWith(
    // cache: 'no-cache' → tarayıcının HTTP önbelleği de sunucuyla doğrulanır;
    // aksi halde eski index.html/app.js günlerce sunulabiliyordu.
    fetch(req, { cache: 'no-cache' })
      .then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(req).then((cached) => {
          if (cached) return cached;
          if (req.mode === 'navigate') return caches.match('./index.html');
        })
      )
  );
});
