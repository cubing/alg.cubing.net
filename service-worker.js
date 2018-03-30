// From https://github.com/mozilla/serviceworker-cookbook/blob/f724cb1ac8c6fe0a65b462ecfa1f9495cc4320d8/strategy-network-or-cache/index.js
var CACHE = 'network-or-cache';

// On install, cache some resource.
self.addEventListener('install', function(evt) {
  console.log('The service worker is being installed.');

  // Ask the service worker to keep installing until the returning promise
  // resolves.
  evt.waitUntil(precache());
});

// On fetch, use cache but update the entry with the latest contents
// from the server.
self.addEventListener('fetch', function(evt) {
  // Try network and if it fails, go for the cached copy.
  evt.respondWith(fromNetwork(evt.request, 400).catch(function () {
    return fromCache(evt.request);
  }));
});

// Open a cache and use `addAll()` with an array of assets to add all of them
// to the cache. Return a promise resolving when all the assets are added.
function precache() {
  return caches.open(CACHE).then(function (cache) {
    return cache.addAll([
      "./",
      "./alg.cubing.net.css",
      "./viewer.css",
      "./lib/font-awesome/css/font-awesome.min.css",
      "./lib/font-awesome/fonts/fontawesome-webfont.woff2",
      "./lib/font-awesome/fonts/fontawesome-webfont.ttf",
      // twisty.js libraries and code
      "./twisty.js/lib/jquery-1.11.0.min.js",
      "./twisty.js/lib/Three.js",
      "./twisty.js/twisty.js",
      "./twisty.js/alg/alg_jison.js",
      "./twisty.js/alg/alg.js",
      "./twisty.js/puzzles/cube.js",
      // alg.cubing.net libraries and code
      "./lib/angular.js",
      "./lib/angular-debounce.js",
      "./lib/clipboard.js",
      "./lib/elastic.js",
      "./alg.cubing.net.js"
    ]);
  });
}

// Time limited network request. If the network fails or the response is not
// served before timeout, the promise is rejected.
function fromNetwork(request, timeout) {
  return new Promise(function (fulfill, reject) {
    // Reject in case of timeout.
    var timeoutId = setTimeout(reject, timeout);
    // Fulfill in case of success.
    fetch(request).then(function (response) {
      clearTimeout(timeoutId);
      fulfill(response);
    // Reject also if network fetch rejects.
    }, reject);
  });
}

// Open the cache where the assets were stored and search for the requested
// resource. Notice that in case of no matching, the promise still resolves
// but it does with `undefined` as value.
function fromCache(request) {
  return caches.open(CACHE).then(function (cache) {
    return cache.match(request, {ignoreSearch: true}).then(function (matching) {
      return matching || Promise.reject('no-match');
    });
  });
}