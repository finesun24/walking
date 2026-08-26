// 오프라인 캐싱은 범위 밖(PRD 4.2). 설치 가능성 확보용 최소 pass-through 핸들러.
self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});
