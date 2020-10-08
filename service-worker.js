'use strict';

const site_cache = 'site_cache';

const site_offline_path = '/offline/';

const site_autocached_assets = {
    essential: [ site_offline_path ],
    supporting: []
};

self.addEventListener('install', function(event) {
    console.log('Preparing to install service worker.');
    event.waitUntil(
        caches.open(site_cache)
        .then(function(cache) {
            cache.addAll(site_autocached_assets.supporting);
            return cache.addAll(site_autocached_assets.essential);
        })
        .catch(function(error) {
            console.error('Caches error:', error);
        })
    );
});

self.addEventListener('activate', function(event) {
    console.log('Installed service worker is activated.');
    event.waitUntil(
        caches.keys()
        .then(function(existing_caches) {
            return Promise.all(
                existing_caches.map(function(existing_cache) {
                    if (existing_cache != site_cache) {
                        return caches.delete(existing_cache);
                    }
                })
            );
        })
        .then(function() {
            return clients.claim();
        })
    );
});

self.addEventListener('fetch', function(fetch_event) {
    const request = fetch_event.request;
    if (request.headers.get('Accept').includes('text/html')) {
        fetch_event.respondWith(
            fetch(request)
            .then(function(fetch_response) {
                const copy = fetch_response.clone();
                fetch_event.waitUntil(
                    caches.open(site_cache)
                    .then(function(this_cache) {
                        this_cache.put(request, copy);
                    })
                );
                return fetch_response
            })
            .catch(function(error) {
                return caches.match(request)
                .then(function(cached_response) {
                    if (cached_response) {
                        return cached_response;
                    }
                    return caches.match(site_offline_path);
                });
            })
        );
        return;
    } else {
        fetch_event.respondWith(
            caches.match(request)
            .then(function(cached_response) {
                if (cached_response) {
                    fetch_event.waitUntil(
                        fetch(request)
                        .then(function(fetch_response) {
                            caches.open(site_cache)
                            .then(function(this_cache) {
                                return this_cache.put(request, fetch_response);
                            });
                        })
                    );
                    return cached_response;
                }
                return fetch(request)
                .then(function(fetch_response) {
                    const copy = fetch_response.clone();
                    fetch_event.waitUntil(
                        caches.open(site_cache)
                        .then(function (this_cache) {
                            this_cache.put(request, copy);
                        })
                    );
                    return fetch_response;
                });
            })
        );
        return;
    }
});