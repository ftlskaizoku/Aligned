const C = 'aligned-v7';
const ASSETS = ['./', 'index.html', 'style.css', 'data.js', 'app.js', 'firebase-config.js', 'cloud.bundle.js', 'manifest.webmanifest', 'icon.svg', 'icon-192.png', 'icon-512.png', 'apple-touch-icon.png'];
// Each file is cached on its own, so one missing file can never break the install.
self.addEventListener('install', e => { e.waitUntil(caches.open(C).then(c => Promise.all(ASSETS.map(a => c.add(a).catch(() => {}))))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== C).map(x => caches.delete(x)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const r0 = e.request, u = new URL(r0.url);
  if (r0.method !== 'GET' || u.origin !== location.origin) return;
  if (/\.(mp4|webm|mov)$/i.test(u.pathname) || r0.headers.has('range')) return; // videos stream from the network, never cached
  e.respondWith(fetch(r0).then(r => { if (r.ok) { const copy = r.clone(); caches.open(C).then(c => c.put(r0, copy)); } return r; })
    .catch(() => caches.match(r0).then(m => m || (r0.mode === 'navigate' ? caches.match('index.html') : Response.error()))));
});
self.addEventListener('notificationclick', e => { e.notification.close(); e.waitUntil(clients.openWindow('./')); });
