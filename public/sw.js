// Service Worker for Rink Reports offline support
const CACHE_NAME = 'rink-reports-v2'
const STATIC_ASSETS = [
  '/',
  '/dashboard',
  '/manifest.json',
]

// API paths that should NOT be cached
const API_PREFIX = '/api/'

// Install: cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  )
  self.skipWaiting()
})

// Activate: clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE_NAME).map((key) => caches.delete(key)))
    )
  )
  self.clients.claim()
})

// Fetch: network first, fall back to cache for GET requests
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)

  // Skip non-GET requests (form submissions queue via IndexedDB)
  if (request.method !== 'GET') return

  // Skip API requests from caching (they use IndexedDB queue for offline)
  if (url.pathname.startsWith(API_PREFIX)) return

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) return

  // For Next.js pages and static assets: network-first with cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses for app shell
        if (response.ok && (
          url.pathname === '/' ||
          url.pathname.startsWith('/dashboard') ||
          url.pathname.startsWith('/_next/static') ||
          url.pathname === '/manifest.json'
        )) {
          const clone = response.clone()
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone))
        }
        return response
      })
      .catch(() => {
        // Offline: serve from cache
        return caches.match(request).then((cached) => {
          if (cached) return cached
          // For navigation requests, serve the cached root page
          if (request.mode === 'navigate') {
            return caches.match('/') || new Response('Offline', { status: 503 })
          }
          return new Response('Offline', { status: 503 })
        })
      })
  )
})

// Background sync for queued form submissions
self.addEventListener('sync', (event) => {
  if (event.tag === 'sync-queue') {
    event.waitUntil(syncQueuedData())
  }
})

async function syncQueuedData() {
  // Notify all open tabs to process their sync queues
  const clients = await self.clients.matchAll()
  clients.forEach((client) => {
    client.postMessage({ type: 'SYNC_REQUESTED' })
  })
}

// Listen for messages from clients
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
})
