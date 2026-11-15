# Aventura Vida Biblia — Godot

Este es el nuevo proyecto Godot 4, separado de la aplicación web existente para proteger el respaldo.

## Abrir
1. Descarga esta carpeta completa.
2. En Godot 4, selecciona **Importar**.
3. Elige el archivo `project.godot` de esta carpeta.
4. Pulsa **Ejecutar proyecto**.

## Controles iniciales
- WASD: moverse.
- Ratón: mirar.
- Espacio: saltar.
- B: construir una sección de muralla (cuesta 3 maderas).
- ESC: liberar el ratón.

## Qué contiene esta primera base
- Mundo 3D generado por código.
- Personaje con movimiento y cámara.
- Recolección de madera.
- Construcción inicial de murallas.
- HUD de recursos y provisiones.
- Estructura preparada para añadir supervivencia, rangos, misiones, batallas fantásticas y sincronización con la web.

## Arquitectura objetivo
- `apps/godot`: videojuego 3D y exportaciones PC/Android/Web.
- `apps/web` (aplicación existente): cuenta, catálogo de los 14 juegos, perfiles y portal del mundo.
- API compartida: identidad, progreso, inventario, rangos, misiones y resultados.
- Los minijuegos se abren desde el catálogo y se conectan con el mundo mediante recompensas y misiones.

Esta base es un punto de partida ejecutable, no la versión final ni una afirmación de que todos los sistemas estén terminados. Antes de publicar, debe abrirse y probarse en Godot 4.
