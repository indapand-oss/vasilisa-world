/* Vasilisa World — офлайн-режим.
   Сначала пробуем сеть (чтобы всегда была свежая версия), без сети — берём из кэша. */
const CACHE = 'vasilisa-world-v2';
const ASSETS = [
  './',
  'index.html',
  'css/style.css',
  'manifest.webmanifest',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/apple-touch-icon.png',
  'js/util.js',
  'js/data.js',
  'js/storage.js',
  'js/audio.js',
  'js/speech.js',
  'js/gfx.js',
  'js/hero.js',
  'js/items.js',
  'js/ui.js',
  'js/art.js',
  'js/levels.js',
  'js/game.js',
  'js/screens.js',
  'js/hall.js',
  'js/main.js',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE)
      .then((cache) => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

function fromNetwork(request) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(new Error('timeout')), 4000);
    fetch(request).then(
      (response) => {
        clearTimeout(timer);
        resolve(response);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      }
    );
  });
}

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    fromNetwork(req)
      .then((response) => {
        if (response && response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(req, copy));
        }
        return response;
      })
      .catch(() =>
        caches.match(req, { ignoreSearch: true }).then((hit) => hit || caches.match('index.html'))
      )
  );
});
