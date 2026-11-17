# Auditoría maestra y plan de integración web — Aventura Vida

Fecha de auditoría: 2026-11-16

## Objetivo

Unificar en la web Aventura Vida los juegos ya implementados, la experiencia 3D planificada, la progresión del jugador, la tienda virtual y las herramientas de administración. La implementación debe ampliar la arquitectura existente, no reemplazarla ni crear una segunda plataforma paralela.

## Inventario verificado en el repositorio

- Aplicación Next.js 15 con App Router, React 19 y TypeScript.
- Catálogo en `lib/content.ts`, con fichas, categorías, edades sugeridas, objetivos y rutas de juego.
- Rutas públicas `/`, `/juegos`, `/juegos/[slug]`, `/aventuras`, `/mision`, `/ranking` y `/perfil`.
- Navegación ya incluye `/tienda`, `/pvp`, `/multiplayer`, `/campo-de-batalla` y `/recompensas`.
- La tienda `/tienda` ya consume `/api/economy/store`, permite canjear objetos con Monedas de Aventura y muestra inventario.
- La compra de tienda exige cuenta autenticada, valida en servidor y usa clave de idempotencia.
- Prisma incluye perfiles, progreso, billetera, inventario, partidas, misiones, logros y modelos de comunidad.
- PWA y soporte offline parcial ya están implementados.
- El manifiesto de dependencias incluye React Three Fiber, Drei y Three.js, pero el commit más reciente solo añadió dependencias; no agregó una escena ni una ruta web 3D.
- El README afirma 15 juegos, pero hay que verificar individualmente que cada ficha abra el juego correcto y que su progreso/recompensas funcionen de extremo a extremo.

## Hallazgo bloqueante de despliegue

El último despliegue de producción (commit `e58bf7a4d1a81a4b3c99054fa443a53a8dd849aa`) falló en la instalación por `ERR_PNPM_OUTDATED_LOCKFILE`: `package.json` añadió `@react-three/fiber`, `@react-three/drei` y `three`, pero `pnpm-lock.yaml` no fue actualizado.

La versión anterior `a97ea982680e1ca93eebf2dac863e427f0299f2f` aparece como READY. Mantenerla como referencia estable. Antes de integrar la escena 3D, sincronizar el lockfile con pnpm y ejecutar lint, typecheck y build.

## Arquitectura objetivo

### 1. Portal y biblioteca
- Inicio con una llamada principal clara para jugar.
- Catálogo con búsqueda y filtros, fichas con capturas reales, controles, edad sugerida, duración y estado de disponibilidad.
- Cada juego debe abrir su implementación real; nunca mostrar como jugable un prototipo vacío.
- Carga progresiva, pantallas de error/recuperación y diseño adaptable a teclado, mouse y toque.

### 2. Mundo 3D — Aventura de la Fe
- Crear una ruta propia `/mundo-3d` y una experiencia 3D cargada solo en cliente.
- Primera entrega: escena explorable con cámara, avatar, terreno, caminos, puntos de interés y controles de teclado/táctiles.
- Entregas siguientes: interacción con objetos, construcción por piezas, inventario visual, misiones, zonas temáticas bíblicas y progreso guardado.
- Añadir actividades cooperativas y desafíos de fantasía solo después de que movimiento, colisiones, guardado y rendimiento estén probados.
- No presentar funciones planificadas como terminadas.

### 3. Progreso común
- Reutilizar la identidad y el progreso actual del jugador.
- Los juegos reportan sesiones y resultados mediante contratos del Game SDK.
- XP, monedas, logros y recompensas deben validarse en servidor; no confiar en valores enviados por el cliente.
- Los visitantes pueden probar juegos, pero el progreso premiable persistente requiere cuenta.

### 4. Tienda virtual
- Mantener la tienda de Monedas de Aventura existente.
- Conectar los artículos comprados con los módulos de avatar, personajes y escenarios; mostrar claramente qué artículos solo se coleccionan y cuáles se pueden equipar.
- Añadir filtros por tipo y rareza, vista previa y estados de propiedad/desbloqueo.
- No activar pagos con dinero real sin diseño de protección, revisión adulta, proveedor autorizado, términos, privacidad y pruebas de seguridad.

### 5. Administración y seguridad
- CRUD de catálogo y metadatos de juegos, revisión de contenido, gestión de artículos y moderación.
- No exponer secretos ni datos personales en cliente.
- Para una audiencia infantil/familiar, minimizar datos, usar apodos y avatares, y probar permisos y reportes.

## Criterios de calidad tomados de plataformas web de juegos

- El jugador debe entender qué hacer y empezar rápidamente.
- Instrucciones visuales breves y controles consistentes.
- Cargas ligeras, respuesta inmediata y diseño legible en móvil y escritorio.
- Objetivos claros, dificultad gradual, feedback de logros y sesiones rejugables.
- Capturas auténticas de gameplay y mantenimiento frecuente.
- Medir errores, tiempo de carga, conversión a inicio de partida y puntos donde los jugadores abandonan.

## Orden de ejecución

1. Recuperar compilación: sincronizar `pnpm-lock.yaml`; verificar `pnpm install --frozen-lockfile`, `pnpm lint`, `pnpm typecheck` y `pnpm build`.
2. Auditar las 15 fichas frente a sus módulos reales; corregir rutas rotas y marcar prototipos como tales.
3. Crear el primer mundo 3D navegable en `/mundo-3d`, sin alterar las rutas de los juegos existentes.
4. Integrar movimiento y puntos de interacción con progreso del jugador.
5. Conectar inventario de tienda a cosméticos equipables.
6. Probar en móvil, tablet y escritorio; desplegar primero a Preview y promover a producción solo después de pruebas.

## Estado

Este documento registra el inventario y el plan. No afirma que el mundo 3D esté terminado ni que los pagos comerciales estén activos. La rama de trabajo es `feat/plataforma-web-mundo-3d`; producción no debe modificarse hasta que Preview pase las verificaciones.


## Corrección de auditoría — revisión de main y módulos reales (16-11-2026)

La revisión adicional de `main` encontró una primera ruta `/mundo-3d` y el componente `components/creation-world.tsx`. El prototipo ya renderiza un valle 3D con cámara de seguimiento, personaje oficial Vida Kids, casas, árboles, río y cuatro luces coleccionables. El progreso de esas luces se guarda en `localStorage`, no en el perfil de servidor.

La versión de la rama de trabajo contenía una regresión de cámara: el helper `requireThree()` devolvía una cámara nula. La rama ahora recupera `useThree()` y añade salto real y controles táctiles de movimiento. Sigue siendo un prototipo de una zona: aún faltan colisiones del escenario, cámara configurable, animaciones del personaje, más zonas, construcción, inventario persistente, NPC completos, misiones de servidor y sincronización 3D multiplayer.

### Sistemas que ya existen y se deben reutilizar

- Catálogo: se contaron 15 entradas en `lib/content.ts`; cada una aún requiere una prueba de apertura y progreso real.
- Cooperativo: Socket.IO, salas de Laberinto Bíblico de hasta cuatro jugadores, sincronización de acciones, reconexión y chat de frases predefinidas.
- VS online: matchmaking y duelos 1 vs 1 de preguntas, tres rondas, respuestas y puntuación validadas en servidor, reconexión y ranking/historial.
- IA: proveedor OpenAI solo en backend, esquema estructurado, validación y borradores editoriales. La ruta jugable actual de IA está limitada a preguntas; no genera mundos ni publica código automáticamente.
- Economía: tienda de Monedas de Aventura con canje en servidor e inventario; falta equipar los artículos dentro del avatar y mundo 3D.

### Despliegue multijugador preparado

Se añadió `render.yaml`, guía `docs/MULTIPLAYER_DEPLOYMENT.md` y soporte para que el servidor respete la variable `PORT` del hosting. El servicio externo todavía no se ha creado ni configurado. Requiere URL HTTPS, `DATABASE_URL`, variable `NEXT_PUBLIC_MULTIPLAYER_SERVER_URL` en Vercel y pruebas externas. El plan gratuito puede suspender el proceso inactivo y no equivale a un servidor de disponibilidad continua.

### Estado de compilación y ramas

La rama `feat/plataforma-web-mundo-3d` sigue separada de `main`. La comparación más reciente indicó 9 commits por delante y 2 por detrás; no integrar hasta revisar esa divergencia. `pnpm-lock.yaml` sigue sin las dependencias `@react-three/fiber`, `@react-three/drei` y `three`, así que Vercel continúa fallando con `ERR_PNPM_OUTDATED_LOCKFILE`. No se ha confirmado una compilación, prueba E2E ni despliegue Preview exitoso de estos cambios.


### Hallazgo adicional de catálogo

La comparación entre `lib/content.ts`, `lib/games/registry.ts` y `components/games/game-player.tsx` encontró que las 15 fichas tienen un adaptador en el lanzador, pero `little-big-heroes` no estaba registrado en el registro central de juegos. La rama añade ese manifiesto para que el cerebro central también lo reconozca. Esta corrección no sustituye la prueba manual de inicio, finalización y persistencia de cada juego.


## Actualización de avance — 16-11-2026 (rama de trabajo)

La rama ya incluye la ruta /mundo-3d con escena cliente, personaje oficial, cámara recuperada con useThree, movimiento teclado/táctil y salto. La experiencia se amplió con nodos de madera y piedra, inventario local, y construcción decorativa de cabañas y lámparas con coste de materiales. El estado se conserva en localStorage del navegador; no es aún inventario de cuenta ni sincronización multiplayer. Se rediseñó la página para mostrar instrucciones y aclarar esos límites.

Se agregó scripts/verify-world3d.ts y el comando pnpm world:verify, además de un workflow de calidad para correr verificación estática, lint, typecheck y build. El registro central conserva 15 módulos.

Estado de Preview: la compilación inicial reveló un JSON package.json inválido por una inserción de salto de línea literal, que se corrigió. El build siguiente reveló conflicto ERESOLVE porque OpenAI SDK 7.57 requiere peer opcional Zod ^3.25 o ^4.0 y el proyecto tenía Zod 3.24.2. La rama elevó Zod a ^3.25.0; aún falta confirmar el resultado de la Preview y las pruebas CI.

La rama se encuentra 22 commits adelante y 2 detrás de main (comparación actual). No integrar ni promover a producción antes de sincronizar/revisar los commits divergentes, restaurar lockfile pnpm correctamente, ejecutar los checks y confirmar Preview READY.


## Actual implementation update — 16-11-2026 (continued work)

### Bible learning and shop expansion
- Added the /biblia route with 10 guided Bible study cards: creation, Noah, Moses, David, Daniel, Jesus' birth, Good Samaritan, calming the storm, Zacchaeus, and resurrection.
- Each study includes a reference, learning goals, summary, and activity. The page also includes a five-question interactive practice quiz with feedback, reference, score, and replay.
- Added six Bible-inspired collection items to the Prisma seed. They are added idempotently by slug; existing items are preserved.
- Added scripts/verify-bible-content.ts; prebuild checks the study count, question structure, and the six new item slugs.

### Multiplayer health and clarity
- Added /api/multiplayer/health, which probes only the configured MULTIPLAYER_SERVER_URL/health, applies a timeout, validates the service identity, and never returns the configured URL.
- The multiplayer hub now displays online/offline/unconfigured status and latency, with explicit links to the two online modes that are actually implemented: Bible Maze cooperative and Bible quiz duel 1v1.
- Updated docs/MULTIPLAYER_DEPLOYMENT.md: configure both NEXT_PUBLIC_MULTIPLAYER_SERVER_URL (browser Socket.IO connection) and MULTIPLAYER_SERVER_URL (server-side health probe) to the same service URL.
- Added a static integration verifier for the health endpoint and hub.

### Verification and deployment snapshot
- Static prebuild checks have passed on Vercel for the 3D prototype (10 checks), Bible content (10 studies, 5 questions, 6 shop additions), and multiplayer health integration.
- A Vercel Preview for commit f0a37a93a486bc32ade07f20dbba5f740810038a reported “Compiled successfully”; lint/type checking was still running at the last observation.
- A newer Preview for commit 8f10f67aa5f14a7bddd94a1f9487c8f75d83f662 was queued. These states do not mean production is deployed.
- A verifier count bug and top-level-await compatibility issue in the static scripts were found from build logs and corrected on the branch; those newest fixes still require a fresh completed build.
- The branch remains a draft PR and is not integrated into production. External Socket.IO hosting, DB/environment configuration, lockfile restoration, branch synchronization, and tests for every game's online adapter remain open work.
