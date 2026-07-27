/**
 * SIPS - Service Worker v1.0
 * Strategi Cache: Cache First, falling back to network.
 * Dioptimalkan untuk performa offline (Aplikasi LocalStorage)
 */

const CACHE_NAME = 'sips-cache-v1.0';
const ASSETS_TO_CACHE = [
    './',
    './index.html',
    './manifest.json',
    'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
];

// Instalasi Service Worker dan Caching Assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => {
                return cache.addAll(ASSETS_TO_CACHE);
            })
            .then(() => {
                return self.skipWaiting(); // Memaksa SW baru untuk segera aktif
            })
    );
});

// Menghapus cache lama jika ada pembaruan versi
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => {
            return self.clients.claim();
        })
    );
});

// Intersepsi Fetch Requests
self.addEventListener('fetch', (event) => {
    // Abaikan request yang bukan GET (walaupun aplikasi ini murni JS Client-side)
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request)
            .then((response) => {
                // Return cache jika ada, jika tidak, fetch dari network
                return response || fetch(event.request).then((fetchResponse) => {
                    // (Opsional) Jangan cache request dari API eksternal yang dinamis jika nanti ada.
                    // Saat ini aplikasi fully offline, jadi aman.
                    return fetchResponse;
                });
            })
    );
});