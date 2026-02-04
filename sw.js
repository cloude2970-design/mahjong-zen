const CACHE_NAME = 'mahjong-zen-v1';
const ASSETS = [
  '/mahjong-zen/',
  '/mahjong-zen/index.html',
  '/mahjong-zen/manifest.json'
];

// 安装时缓存核心资源
self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

// 激活时清理旧缓存
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// 网络优先，离线回退缓存
self.addEventListener('fetch', (e) => {
  e.respondWith(
    fetch(e.request)
      .then(response => {
        // 网络成功，更新缓存
        if (response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(e.request, clone);
          });
        }
        return response;
      })
      .catch(() => {
        // 网络失败，使用缓存
        return caches.match(e.request);
      })
  );
});
