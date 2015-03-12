console.log("Loaded service worker.");

var CACHE_VERSION = 1;
var CURRENT_CACHES = {
  'network-if-possible': 'network-if-possible-v' + CACHE_VERSION
};

self.addEventListener('activate', function(event) {
  // Delete all caches that aren't named in CURRENT_CACHES.
  // While there is only one cache in this example, the same logic will handle the case where
  // there are multiple versioned caches.
  var expectedCacheNames = Object.keys(CURRENT_CACHES).map(function(key) {
    return CURRENT_CACHES[key];
  });

  event.waitUntil(
    caches.keys().then(function(cacheNames) {
      return Promise.all(
        cacheNames.map(function(cacheName) {
          if (expectedCacheNames.indexOf(cacheName) == -1) {
            // If this cache name isn't present in the array of "expected" cache names, then delete it.
            console.log('Deleting out of date cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

function normalizeResourceURL(url) {
  return url.split("/?")[0];
}

self.addEventListener('fetch', function(event) {
  caches.open(CURRENT_CACHES['network-if-possible']).then(function(cache) {
    event.respondWith(
      fetch(event.request).then(function(response) {
        cache.put(normalizeResourceURL(event.request.url), response.clone());
        // console.log("From network:", event.request.url)
        return response;
      }).catch(function(x) {
        // console.log("Falling back to cache:", event.request.url)
        return cache.match(normalizeResourceURL(event.request.url));
      })
    );
  });
});

console.log("Finished service worker code.");
