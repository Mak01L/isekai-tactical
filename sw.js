// Isekai Tactical — Service Worker
const CACHE = 'isekai-tactical-v1';

// Files to cache for offline use
const PRECACHE = [
  '/isekai-tactical/warrior-grid-online.html',
  '/isekai-tactical/manifest.json',
  '/isekai-tactical/icon-192.png',
  '/isekai-tactical/icon-512.png',
  '/isekai-tactical/menu-music.mp3',
  '/isekai-tactical/battle-music.mp3',
  '/isekai-tactical/sfx-sword.mp3',
  '/isekai-tactical/sfx-magic.mp3',
  '/isekai-tactical/sfx-arrow.mp3',
  '/isekai-tactical/sfx-shield.mp3',
  '/isekai-tactical/sfx-miss.mp3',
  '/isekai-tactical/sfx-death.mp3',
  '/isekai-tactical/sfx-turn.mp3',
  '/isekai-tactical/sfx-victory.mp3',
];

// Install — cache all files
self.addEventListener('install', e=>{
  e.waitUntil(
    caches.open(CACHE).then(cache=>{
      return Promise.allSettled(
        PRECACHE.map(url => cache.add(url).catch(()=>{}))
      );
    })
  );
  self.skipWaiting();
});

// Activate — clean old caches
self.addEventListener('activate', e=>{
  e.waitUntil(
    caches.keys().then(keys=>
      Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch — cache first, fallback to network
self.addEventListener('fetch', e=>{
  // Skip Firebase and Google Fonts (always needs network)
  if(e.request.url.includes('firebase') ||
     e.request.url.includes('googleapis') ||
     e.request.url.includes('gstatic')){
    return;
  }
  e.respondWith(
    caches.match(e.request).then(cached=>{
      return cached || fetch(e.request).then(response=>{
        // Cache new files dynamically
        if(response.ok){
          const clone = response.clone();
          caches.open(CACHE).then(cache=>cache.put(e.request, clone));
        }
        return response;
      });
    }).catch(()=> caches.match('/isekai-tactical/warrior-grid-online.html'))
  );
});
