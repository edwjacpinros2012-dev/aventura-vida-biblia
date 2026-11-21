# Los 3 niños y los portales poderosos — prototipo

Esta rama añade un prototipo web 3D jugable usando **los seis avatares existentes** del catálogo de Proyecto Vida Kids. No introduce nuevos personajes gráficos.

## Ruta
- `/portales-poderosos`

## Implementación
- React Three Fiber + Three.js (ya presentes en package.json).
- Avatares PNG existentes como billboards dentro del mundo 3D.
- El avatar elegido por el jugador y dos compañeros siguen al personaje controlado.
- WASD/flechas y botones táctiles.
- Capítulo 1: reunir tres luces, abrir el portal, entrar a la nave, reunir tres cristales y liberar una criatura amistosa.
- Capítulos 2–7 aparecen como plan de historia; no se anuncian como jugables todavía.
- La selección de avatar y final de capítulo 1 se guardan localmente.

## QA pendiente
- Instalar dependencias y ejecutar `npm run typecheck`, `npm run lint`, `npm run build`.
- Comprobar la escena en escritorio y móvil, sensibilidad de controles y carga de las seis texturas.
- La escena es una primera iteración de prototipo; los personajes PNG se representan como sprites 2D en el espacio 3D, no como modelos 3D riggeados.
