// From https://github.com/NekR/self-destroying-sw
self.addEventListener("activate", function (event) {
  event.waitUntil(
    caches.keys().then(function (cacheNames) {
      return Promise.all(
        cacheNames
          .filter(function (_cacheName) {
            // Return true if you want to remove this cache,
            // but remember that caches are shared across
            // the whole origin
            return true;
          })
          .map(function (cacheName) {
            return caches.delete(cacheName);
          })
      );
    })
  );
});
