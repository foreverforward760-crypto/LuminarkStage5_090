// sw.js - KAIROS Service Worker (Cache-First PWA)
const CACHE = 'kairos-v2';
const URLS  = ['.','css/styles.css','js/engine.js','js/content.js','js/state.js','js/audio.js','js/visuals.js','js/app.js','manifest.json'];

self.addEventListener('install',  e => e.waitUntil(caches.open(CACHE).then(c => c.addAll(URLS))));
self.addEventListener('activate', e => e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k))))));
self.addEventListener('fetch',    e => e.respondWith(caches.match(e.request).then(r => r || fetch(e.request))));
