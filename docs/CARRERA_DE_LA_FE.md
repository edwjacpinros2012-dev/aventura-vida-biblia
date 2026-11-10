# La Carrera de la Fe

## Integración inicial

- Identificador del catálogo: `carrera-de-la-fe`.
- Módulo de juego: `components/games/carrera-de-la-fe-game.tsx`.
- Motor 3D: Babylon.js cargado desde el CDN oficial en el cliente.
- Entrada web: `/juegos/la-carrera-de-la-fe` y `/juegos/la-carrera-de-la-fe/jugar`.
- Aventura relacionada: `/aventuras/carrera-de-la-fe`.

## Controles y bucle de juego

- Tres carriles con cambio izquierda/derecha.
- Salto para superar obstáculos de suelo.
- Deslizamiento para pasar bajo barreras.
- Obstáculos y destellos que aparecen progresivamente.
- Distancia, destellos recogidos y récord local.
- Controles táctiles y teclado.

## Conexión con el mundo y el progreso

El módulo mantiene su estado de partida separado del motor visual. La futura integración con el mundo abierto debe enviar eventos mediante `lib/game-sdk/contracts.ts`, donde el servidor validará puntos, XP y recursos. Los destellos de esta primera versión son puntuación local y todavía no conceden recursos del reino ni recompensas verificadas.

## Android

La interfaz usa canvas WebGL y botones táctiles, por lo que puede reutilizarse en la futura aplicación Android/PWA. Antes de publicar sin conexión, se debe empaquetar Babylon.js localmente en lugar de depender del CDN. El récord de esta primera versión se guarda únicamente en el dispositivo.
