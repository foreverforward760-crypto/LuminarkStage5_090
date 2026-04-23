// sw.js - KAIROS Service Worker v1.1
// Audit fix: robust cache strategy, works on GitHub Pages, Render, and custom domains

const CACHE_NAME = 'kairos-v8';
const STATIC_ASSETS = [
    './',
    './index.html',
    './css/styles.css',
    './js/engine.js',
    './js/content.js',
    './js/state.js',
    './js/audio.js',
    './js/visuals.js',
    './js/app.js',
    './js/maat.js',
    './js/lexicon.js',
    './js/cultural.js',
    './js/ai-sentinel.js',
    './manifest.json',
];

// Install: pre-cache all static assets
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(STATIC_ASSETS))
            .then(() => self.skipWaiting()) // activate immediately
    );
});

// Activate: clear old caches
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
        ).then(() => self.clients.claim()) // take control of all clients immediately
    );
});

// Fetch: cache-first for static, network-first for navigation
self.addEventListener('fetch', event => {
    const { request } = event;
    // Skip non-GET and chrome-extension requests
    if (request.method !== 'GET' || request.url.startsWith('chrome-extension')) return;

    event.respondWith(
        caches.match(request).then(cached => {
            if (cached) return cached;
            return fetch(request).then(response => {
                // Cache valid responses
                if (response && response.status === 200 && response.type === 'basic') {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
                }
                return response;
            }).catch(() => {
                // Offline fallback for navigation requests
                if (request.mode === 'navigate') return caches.match('./index.html');
            });
        })
    );
});
