const CACHE = "aventura-vida-shell-v5";
const SHELL = ["/", "/juegos", "/mision", "/offline", "/manifest.webmanifest", "/icon", "/icon-192", "/icon-maskable"];
const OFFLINE_PACK = [...SHELL, "/api/content/offline"];

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    // Una ruta opcional que no exista no debe impedir instalar la PWA.
    await Promise.allSettled(SHELL.map((url) => cache.add(url)));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((key) => key.startsWith("aventura-vida-shell-") && key !== CACHE).map((key) => caches.delete(key))))
    .then(() => self.clients.claim()));
});

// La pantalla de inicio puede pedir una descarga explícita del paquete público.
self.addEventListener("message", (event) => {
  if (event.data?.type !== "CACHE_OFFLINE_PACK") return;
  const port = event.ports?.[0];
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const results = await Promise.allSettled(OFFLINE_PACK.map((url) => cache.add(url)));
    const failed = results.flatMap((result, index) => result.status === "rejected" ? [OFFLINE_PACK[index]] : []);
    port?.postMessage({ type: "OFFLINE_PACK_RESULT", ok: failed.length === 0, cached: OFFLINE_PACK.length - failed.length, total: OFFLINE_PACK.length, failed });
  })());
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  const isOfflineContent = url.pathname === "/api/content/offline";
  const isStaticAsset = url.pathname.startsWith("/_next/") || /\\.(?:png|jpg|jpeg|webp|svg|woff2?)$/i.test(url.pathname);
  const isNavigation = event.request.mode === "navigate";
  // No guardar HTML de cuentas, perfil, economía o partidas en una caché que
  // podría reutilizarse después de cambiar de usuario en el mismo dispositivo.
  const isPrivateNavigation = ["/perfil", "/coleccion", "/pvp", "/multiplayer", "/admin"].some((path) => url.pathname === path || url.pathname.startsWith(`${path}/`));
  if (url.pathname.startsWith("/api/") && !isOfflineContent) return;
  if (isPrivateNavigation) return;

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
