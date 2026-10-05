/* ==========================================================
   SPORT JOURNAL – service-worker.js
   Stratégie « réseau d'abord » : l'utilisateur reçoit toujours la dernière
   version quand il est en ligne, et le cache prend le relais hors ligne.
   ========================================================== */
const CACHE_VERSION = 'sj-v2';
const SHELL = [
  './', './index.html', './style.css', './app.js', './manifest.json',
  './assets/icons/icon.svg', './assets/icons/icon-192.png', './assets/icons/icon-512.png',
  './assets/vendor/chart.umd.min.js',   // Chart.js local (ajouté à l'étape Statistiques)
];

// Installation : chaque fichier est mis en cache séparément (un fichier absent ne bloque rien).
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => Promise.all(SHELL.map((url) => cache.add(url).catch(() => null))))
      .then(() => self.skipWaiting())
  );
});

// Activation : suppression des anciens caches (ex. « sj-v1 »).
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

// Requêtes : réseau d'abord ; en cas d'échec (hors ligne), réponse depuis le cache.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  event.respondWith(
    fetch(event.request).then((res) => {
      if (res.ok && new URL(event.request.url).origin === location.origin) {
        const copy = res.clone();
        caches.open(CACHE_VERSION).then((c) => c.put(event.request, copy));
      }
      return res;
    }).catch(() => caches.match(event.request).then((hit) => hit || caches.match('./index.html')))
  );
});
