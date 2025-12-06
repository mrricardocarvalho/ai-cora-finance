self.addEventListener('push', function(event) {
  let data = { title: 'Notification', body: 'You have a new message', url: '/' }
  try{ data = event.data ? event.data.json() : data }catch(e){ /* ignore parsing error */ }
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.svg',
    badge: '/icons/badge-72x72.svg',
    data: { url: data.url }
  }
  event.waitUntil(
    self.registration.showNotification(data.title, options)
  )
});

self.addEventListener('notificationclick', function(event){
  event.notification.close()
  const url = event.notification.data?.url || '/'
  event.waitUntil(clients.openWindow(url))
})

// PWA caching: App shell & API stale-while-revalidate
const CACHE = 'cora-cache-v2'
const ASSETS_TO_CACHE = [
  '/',
  '/manifest.json',
  '/icons/icon-192x192.svg',
  '/icons/icon-512x512.svg',
  '/icons/maskable-icon.svg',
  '/offline.html'
]

self.addEventListener('install', (event) => {
  // cache assets selectively and tolerate failures
  event.waitUntil(
    caches.open(CACHE).then(async (cache) => {
      try{
        await cache.addAll(ASSETS_TO_CACHE)
      }catch(e){
        // try adding items individually to avoid blocking install
        for(const a of ASSETS_TO_CACHE){
          try{ await cache.add(a) }catch(_){ /* ignore individual failures */ }
        }
      }
    })
  )
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
  )
  self.clients && self.clients.claim && self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const req = event.request
  const url = new URL(req.url)
  // handle api requests with stale-while-revalidate but only for whitelisted GETs
  if(url.pathname.startsWith('/api') && req.method === 'GET'){
    // whitelist of cache-safe API endpoints (public, idempotent, non-user-specific)
    const WHITELIST = ['/api/accounts/brokers', '/api/status/privacy']
    if(!WHITELIST.some(p => url.pathname.startsWith(p))) return
    event.respondWith(
      caches.open(CACHE).then(cache =>
        cache.match(req).then(cached => {
          const fetchPromise = fetch(req).then(resp => { try{ if(resp && resp.ok) cache.put(req, resp.clone()) }catch(e){}; return resp })
          return cached || fetchPromise
        })
      )
    )
    return
  }
  // HTML navigation network-first strategy
  if(req.mode === 'navigate'){
    event.respondWith(
      fetch(req).then(resp => { caches.open(CACHE).then(c => c.put(req, resp.clone())); return resp }).catch(()=> caches.match(req).then(cached => cached || caches.match('/offline.html')))
    )
    return
  }
  // Cache-first for assets
  event.respondWith(caches.match(req).then(cached => cached || fetch(req)) )
})
