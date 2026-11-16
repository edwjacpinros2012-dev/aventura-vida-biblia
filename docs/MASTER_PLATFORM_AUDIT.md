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
