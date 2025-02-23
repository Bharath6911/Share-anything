self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open('Shareanything-cache-v1').then((cache) => {
            return cache.addAll([
                'index.html',
                'css.css',
                'js.js',
                'public'
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});
