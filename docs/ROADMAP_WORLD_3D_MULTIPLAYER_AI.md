# Hoja de ruta del universo Aventura Vida

Este documento separa funciones existentes, mejoras pendientes y nuevas ideas. Ninguna propuesta se considera jugable hasta tener implementación, pruebas y despliegue.

## 1. Plataforma unificada

- Catálogo de juegos y aventuras con fichas reales, capturas, controles, progreso y accesibilidad móvil.
- Identidad única: perfil, avatar, XP, monedas virtuales, inventario, logros y misiones.
- La tienda actual usa Monedas de Aventura; falta conectar objetos equipables con los avatares y la escena 3D.
- Panel editorial para revisar juegos, misiones, recursos y propuestas de IA.

## 2. Mundo 3D — Aventura de la Fe

### Primera versión jugable
- Mundo en tercera persona, cámara libre y movimiento en ocho direcciones.
- Terreno continuo con caminos, colinas, agua, vegetación, aldeas y puntos de interés.
- Controles táctiles y teclado, colisiones, salto, interacción y guardado.
- NPC con diálogo, tablón de misiones y mapa de objetivos.
- Carga por zonas y calidad gráfica adaptable para móviles.

### Sistemas que siguen
- Construcción modular: colocar, girar, guardar y retirar piezas con coste de recursos del juego.
- Recursos de mundo: madera, piedra, semillas, agua y cristales de luz; recolección y almacenamiento virtual.
- Taller de creación: recetas, planos, mejoras y objetos decorativos.
- Aventuras bíblicas por regiones, con narrativa apropiada y revisión editorial.
- Desafíos de fantasía no gráficos, centrados en estrategia, cooperación y resolución de objetivos.

## 3. Multijugador y VS online

### Ya existe en el código
- Servidor dedicado Socket.IO, separado de las funciones web.
- Salas cooperativas del Laberinto Bíblico para hasta cuatro participantes.
- Sincronización de acciones, reconexión, chat limitado a frases positivas y controles de acceso.
- PvP de preguntas 1 contra 1, tres rondas, puntuación y resultado calculados en servidor.
- Script de verificación automatizada para salas, movimiento, desconexión, matchmaking y duelo.

### Falta para habilitarlo públicamente
- Desplegar el proceso Socket.IO en un hosting persistente y configurar su URL HTTPS en Vercel.
- Conectar la misma PostgreSQL y aplicar migraciones verificadas.
- Ejecutar las pruebas de integración desde una red externa y desde móvil.
- Añadir persistencia distribuida para matchmaking antes de escalar a varias instancias.
- Ampliar VS a minijuegos compatibles; el combate 3D sincronizado pertenece a una fase posterior del mundo 3D.

## 4. IA central

### Ya existe
- Cliente OpenAI solo en backend, salida estructurada, validación Zod, límite de tiempo y política editorial.
- Propuestas bíblicas que se guardan como borrador y requieren aprobación humana.
- El adaptador jugable actual está limitado al juego de preguntas.

### Ampliación
- Asistente para crear borradores de misiones, diálogos NPC, preguntas, capítulos y niveles.
- Biblioteca de recursos con metadatos: tipo, formato, licencia, tamaño, zona y compatibilidad.
- Validador automático que compruebe que cada propuesta apunta a un módulo real.
- Vista previa y aprobación editorial antes de publicar.
- Nunca permitir que la IA publique código, recompensas o cambios de economía sin validación del servidor.

## 5. Nuevos juegos propuestos

Estas son propuestas de contenido, no juegos ya construidos:
1. **Constructor del Valle:** reunir materiales virtuales y diseñar una aldea por piezas.
2. **Exploradores del Mapa Vivo:** descubrir rutas, resolver pistas y abrir regiones.
3. **Guardianes de la Luz:** cooperación por equipos para activar mecanismos y completar objetivos.
4. **Viaje de las Parábolas:** historias interactivas con decisiones y preguntas de comprensión.
5. **Semillas de Esperanza:** cuidar un jardín, combinar semillas y aprender ciclos de naturaleza.
6. **Reto de Sabiduría VS:** duelos rápidos de preguntas con categorías y niveles equilibrados.

Cada juego necesita un módulo de interfaz, reglas, objetivos, arte, adaptación táctil, contrato de progreso y validación de recompensas en servidor.

## 6. Misiones y progresión

- Misiones diarias, semanales, de historia, exploración, construcción y cooperación.
- Objetivos verificables: visitar zonas, completar minijuegos, resolver acertijos o colaborar.
- Recompensas de XP, logros y monedas virtuales calculadas en servidor.
- Historial, rachas y seguimiento de capítulos.
- No conceder recompensas por eventos enviados libremente desde el navegador.

## 7. Recursos y producción artística

- Biblioteca de modelos 3D originales, materiales, sonidos, música original, iconos y portadas.
- Variantes de bajo poligonaje y texturas optimizadas para móvil.
- Convención de nombres, licencia, autoría, dimensiones y versión para cada recurso.
- Revisión visual para que las portadas correspondan al juego real y no prometan funciones inexistentes.

## 8. Orden de trabajo recomendado

1. Recuperar compilación Vercel sincronizando el lockfile de pnpm.
2. Desplegar el servidor Socket.IO y probar el PvP ya escrito.
3. Verificar las quince fichas y sus módulos de juego uno por uno.
4. Crear la primera escena web 3D explorable con controles completos.
5. Conectar inventario y objetos equipables.
6. Implementar interacción, construcción y recursos.
7. Ampliar misiones y adaptadores de IA.
8. Añadir nuevos minijuegos, pruebas E2E y optimización móvil.
9. Publicar primero en Preview; producción solo después de pruebas aprobadas.

## 9. Dependencias externas

Para completar el despliegue hacen falta una base PostgreSQL accesible, variables secretas configuradas en los entornos correspondientes y un hosting persistente para Socket.IO. Revisar costes, límites del plan y protección de datos antes de activar servicios públicos.


## Implementación parcial añadida — 16-11-2026

En la rama feat/plataforma-web-mundo-3d ya se implementó una primera capa local para el Jardín de la Creación:
- Nodos recolectables de madera y piedra con detección de proximidad.
- Contadores de inventario que persisten en el navegador.
- Cabaña decorativa (coste: 2 madera y 1 piedra) y lámpara (coste: 1 madera), representadas en la escena.
- UI responsive con botones de construcción para escritorio y móvil.
- Página de zona actualizada con controles e información de estado.
- Verificador estático del prototipo y workflow de calidad de rama.

Esto no completa el sistema de construcción previsto: aún no hay colocación libre con selección de posición y rotación, retiro de estructuras, recetas/taller, recursos ilimitados o regenerables, sincronización de inventario en perfil, seguridad de recompensas en servidor, misiones persistentes, colisiones del terreno, regiones múltiples ni construcción/movimiento 3D multiplayer. Mantener este bloque como estado real, no como promesa de producción.
