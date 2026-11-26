const CACHE = "aventura-vida-shell-v6";
const SHELL = ["/","/juegos","/mision","/offline","/aventuras","/juegos/little-big-heroes-run-hero-run","/juegos/little-big-heroes-run-hero-run/jugar","/juegos/vocales-de-luz","/juegos/vocales-de-luz/jugar","/juegos/memoria-biblica","/juegos/memoria-biblica/jugar","/juegos/preguntas-de-aventura","/juegos/preguntas-de-aventura/jugar","/juegos/recolector-de-luz","/juegos/recolector-de-luz/jugar","/juegos/mundo-de-la-creacion","/juegos/mundo-de-la-creacion/jugar","/juegos/guardianes-del-jardin","/juegos/guardianes-del-jardin/jugar","/juegos/el-camino-del-rio","/juegos/el-camino-del-rio/jugar","/juegos/mapa-de-estrellas","/juegos/mapa-de-estrellas/jugar","/juegos/laberinto-biblico","/juegos/laberinto-biblico/jugar","/juegos/sopa-de-letras-biblica","/juegos/sopa-de-letras-biblica/jugar","/juegos/colorear-biblico","/juegos/colorear-biblico/jugar","/juegos/historias-biblicas-interactivas","/juegos/historias-biblicas-interactivas/jugar","/juegos/iq-biblico","/juegos/iq-biblico/jugar","/juegos/aprende-el-versiculo","/juegos/aprende-el-versiculo/jugar","/juegos/rompecabezas-biblico","/juegos/rompecabezas-biblico/jugar","/manifest.webmanifest","/icon","/icon-192","/icon-maskable"];
const OFFLINE_PACK = [...SHELL, "/api/content/offline"];

async function cacheRoute(cache, path) {
  const response = await fetch(path, { headers: { Accept: "text/html" }, cache: "no-store" });
  if (!response.ok) throw new Error(`No se pudo descargar ${path} (${response.status})`);
  const html = await response.clone().text();
  await cache.put(path, response);
  const assetPaths = [...html.matchAll(/(?:src|href)=["']([^"']*\\/_next\\/static\\/[^"']+)["']/g)]
    .map((match) => new URL(match[1], self.location.origin))
    .filter((url) => url.origin === self.location.origin)
    .map((url) => url.href);
  await Promise.allSettled([...new Set(assetPaths)].map(async (asset) => {
    const assetResponse = await fetch(asset);
    if (assetResponse.ok) await cache.put(asset, assetResponse);
    else throw new Error(`No se pudo guardar el recurso ${asset}`);
  }));
}

self.addEventListener("install", (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await Promise.allSettled(["/","/offline","/manifest.webmanifest"].map((url) => cacheRoute(cache, url)));
    await self.skipWaiting();
  })());
});

self.addEventListener("activate", (event) => {
  event.waitUntil(caches.keys()
    .then((keys) => Promise.all(keys.filter((key) => key.startsWith("aventura-vida-shell-") && key !== CACHE).map((key) => caches.delete(key))))
    .then(() => self.clients.claim()));
});

self.addEventListener("message", (event) => {
  if (event.data?.type !== "CACHE_OFFLINE_PACK") return;
  const port = event.ports?.[0];
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    const results = await Promise.allSettled(OFFLINE_PACK.map(async (path) => {
      if (path.startsWith("/api/")) {
        const response = await fetch(path, { cache: "no-store" });
        if (!response.ok) throw new Error(`No se pudo guardar ${path}`);
        await cache.put(path, response);
      } else if (/\\.webmanifest$/.test(path) || /^\\/icon(?:-|$)/.test(path)) {
        const response = await fetch(path);
        if (!response.ok) throw new Error(`No se pudo guardar ${path}`);
        await cache.put(path, response);
      } else {
        await cacheRoute(cache, path);
      }
    }));
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
  const isPrivateNavigation = ["/perfil", "/coleccion", "/pvp", "/multiplayer", "/admin"].some((path) => url.pathname === path || url.pathname.startsWith(`${path}/`));
  if (url.pathname.startsWith("/api/") && !isOfflineContent) return;
  if (isPrivateNavigation) return;

  event.respondWith(fetch(event.request).then((response) => {
    if (response.ok && (isOfflineContent || isStaticAsset || isNavigation)) {
      const copy = response.clone();
      void caches.open(CACHE).then((cache) => cache.put(url.pathname, copy));
    }
    return response;
  }).catch(async () => {
    const cache = await caches.open(CACHE);
    const cached = await cache.match(event.request) || await cache.match(url.pathname);
    if (cached) return cached;
    if (isNavigation) return (await cache.match("/offline")) || (await cache.match("/"));
    return Response.error();
  }));
});
