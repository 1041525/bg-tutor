const CACHE_VERSION = 'v2';
const APP_CACHE = `app-shell-${CACHE_VERSION}`;
const AUDIO_CACHE = `audio-${CACHE_VERSION}`;
const FONT_CACHE = `fonts-${CACHE_VERSION}`;

const APP_SHELL = [
  './',
  './index.html',
  './config.json',
  './words.json',
  './manifest.json',
  './css/styles.css',
  './css/castle-theme.css',
  './js/core/utils.js',
  './js/core/audio.js',
  './js/core/ui.js',
  './js/core/storage.js',
  './js/core/characters.js',
  './js/games/GameRegistry.js',
  './js/games/BaseGame.js',
  './js/games/PhonicsGame.js',
  './js/games/VocabGame.js',
  './js/app.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(APP_CACHE)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== APP_CACHE && key !== AUDIO_CACHE && key !== FONT_CACHE)
          .map(key => caches.delete(key))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);

  if (url.hostname.includes('fonts.googleapis.com') || url.hostname.includes('fonts.gstatic.com')) {
    event.respondWith(
      caches.open(FONT_CACHE).then(cache =>
        cache.match(event.request).then(cached => {
          if (cached) return cached;
          return fetch(event.request).then(response => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  if (url.pathname.endsWith('.mp3')) {
    event.respondWith(
      caches.open(AUDIO_CACHE).then(cache =>
        cache.match(event.request).then(cached => {
          if (cached) return cached;
          return fetch(event.request).then(response => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  if (url.pathname.match(/\.(png|jpg|svg|gif|webp)$/)) {
    event.respondWith(
      caches.open(APP_CACHE).then(cache =>
        cache.match(event.request).then(cached => {
          if (cached) return cached;
          return fetch(event.request).then(response => {
            cache.put(event.request, response.clone());
            return response;
          });
        })
      )
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then(cached => {
      return cached || fetch(event.request);
    })
  );
});
