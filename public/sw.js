const CACHE = "aventura-vida-shell-v3";
const SHELL = ["/", "/juegos", "/mision", "/perfil", "/offline", "/manifest.webmanifest", "/icon"];

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys().then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  const isOfflineContent = url.pathname === "/api/content/offline";
  const isStaticAsset = url.pathname.startsWith("/_next/") || /\.(?:png|jpg|jpeg|webp|svg|woff2?)$/i.test(url.pathname);
  const isNavigation = event.request.mode === "navigate";
  if (url.pathname.startsWith("/api/") && !isOfflineContent) return;

  event.respondWith(fetch(event.request).then((response) => {
    if (response.ok && (isOfflineContent || isStaticAsset || isNavigation)) {
      const copy = response.clone();
      void caches.open(CACHE).then((cache) => cache.put(event.request, copy));
    }
    return response;
  }).catch(async () => {
    const cached = await caches.match(event.request);
    if (cached) return cached;
    if (isNavigation) return (await caches.match("/offline")) || (await caches.match("/"));
    return Response.error();
  }));
});
