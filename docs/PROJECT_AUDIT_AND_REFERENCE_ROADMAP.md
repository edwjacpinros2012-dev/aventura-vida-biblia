# Auditoría funcional y hoja de ruta — Aventura Vida

Fecha de revisión: 2026-11-16

Este documento distingue entre una función que existe en el repositorio y una función que ya está conectada y se refleja en la experiencia del jugador. No declara como terminados sistemas que todavía son prototipos.

## Hallazgos confirmados en el código

| Área | Lo que ya existe | Lo que todavía no queda resuelto |
| --- | --- | --- |
| Tienda | Ruta `/tienda`, catálogo desde PostgreSQL, saldo de Monedas de Aventura, compra autenticada, transacción idempotente y registro en inventario | El inventario indica propiedad, pero no existe un flujo persistente de equipar/quitar ni una unión visual de cada artículo con el avatar o el mundo 3D |
| Navegación | Menú de escritorio y menú desplegable móvil contienen Tienda y Mundo 3D | La barra rápida inferior móvil tomaba únicamente los primeros cinco enlaces; por eso no mostraba Tienda ni Mundo 3D |
| Avatar | Catálogo de seis variantes oficiales, avatar personalizado por capas CSS y selector global de identidad | El prototipo 3D usaba una imagen fija, ignorando la variante oficial elegida por el jugador |
| Mundo 3D | Escena Three.js/React Three Fiber, cámara de seguimiento, movimiento en cuatro direcciones, escenario, casas, árboles, cuatro luces coleccionables y diálogo con guardián | Es un primer prototipo: el escenario es pequeño, las luces se guardan solo en el dispositivo, el salto no está implementado y todavía no hay construcción libre, interiores, NPCs persistentes, vehículos, misiones de servidor ni juego cooperativo dentro de ese mundo |
| Campo de batalla | Página de entrenamiento bíblico con preguntas, respuestas y enseñanza | No es todavía una arena 3D por equipos. No tiene rondas multijugador, zonas capturables, marcador sincronizado, clases visuales ni recompensas validadas por resultado de partida |
| Economía | Monedero y libro mayor de transacciones, catálogo e inventario relacional | Falta una capa de equipamiento y de renderizado para que una compra cambie de verdad la apariencia del personaje o del escenario |
| Multiplayer/PvP | Existen rutas y estructuras de salas/partidas en el repositorio | La presencia de rutas o modelos no demuestra que cada modo esté operativo en producción. Cada modo debe probarse de extremo a extremo y con el servidor conectado |

## Cambios realizados en esta rama

1. La barra inferior móvil ahora incluye accesos directos a Inicio, Juegos, Tienda, Mundo 3D y Misiones, además del Perfil. La tienda deja de depender de abrir el menú desplegable.
2. El prototipo del Jardín de la Creación ahora toma la ilustración del personaje oficial seleccionado cuando existe una variante oficial activa, en lugar de fijar siempre la primera imagen.
3. El mundo 3D incorpora controles táctiles direccionales para móviles. El teclado WASD/flechas se conserva para escritorio.

Estos cambios no convierten por sí solos el prototipo 3D en un mundo completo ni equipan automáticamente los objetos de la tienda.

## Referencias de diseño y qué aprender de ellas

Las referencias se usan para estudiar patrones de diseño y sistemas, no para copiar código, personajes, mapas, marcas, ilustraciones, textos ni interfaces protegidas.

- **Roblox Creator Hub — Avatar:** separa geometría, rig, animación, puntos de anclaje y accesorios. Aplicación al proyecto: los artículos comprados deben tener un tipo de ranura y un punto de anclaje; el personaje debe renderizar el accesorio equipado en todos los lugares donde aparece.  
  https://create.roblox.com/docs/avatar
- **Roblox Creator Hub — Layered accessories:** explica cómo las prendas siguen el rig y se ajustan al cuerpo. Aplicación: ropa y armaduras no deben ser simples iconos superpuestos; necesitan modelos/meshes, rig y pruebas de movimiento.  
  https://create.roblox.com/docs/avatar/layered-accessories
- **Epic Developer Community — Gameplay devices:** muestra cómo los eventos, condiciones, puntos de aparición, reglas y recompensas se conectan como un sistema. Aplicación: una arena necesita estados de partida explícitos, eventos y condiciones de victoria verificadas por servidor.  
  https://dev.epicgames.com/documentation/en-us/fortnite/creating-gameplay-with-devices-in-fortnite
- **Supercell Support — Brawl Stars game modes:** demuestra variedad de objetivos, como capturar zonas, escoltar un objetivo, proteger una base o completar rondas. Aplicación: variar objetivos y mapas, no repetir siempre el mismo combate.  
  https://sc-brawlstars.zendesk.com/hc/en-us/articles/49526599632923-Game-Modes
- **Transformers: Earth Wars — Game Basics:** organiza la experiencia alrededor de colección de personajes, base, construcción/mejora, objetivos y enfrentamientos. Aplicación para la sección original **Eras Wars**: combinar colección de mechs originales, transformación robot/vehículo, construcción de base, defensa, expediciones y batallas por objetivos.  
  https://tfew.zendesk.com/hc/en-us/articles/4733784011807-Game-Basics

## Hoja de ruta priorizada

### P0 — Cerrar los circuitos básicos
- [ ] Ejecutar lint, typecheck y build en CI para esta rama.
- [ ] Probar en móvil la barra rápida y la ruta `/tienda`.
- [ ] Probar compra con saldo suficiente/insuficiente, objeto repetido, sesión cerrada y recarga de página.
- [ ] Añadir equipamiento persistente por ranuras (cabeza, torso, espalda, efecto, compañero/escenario según tipo).
- [ ] Hacer que el avatar muestre el equipamiento equipado en perfil, colección, salas, PvP y mundo 3D.
- [ ] Mantener las compras y recompensas validadas exclusivamente en servidor.

### P1 — Hacer jugable el mundo
- [ ] Persistir posición, recursos, objetos y misiones en cuenta; conservar modo visitante con límites claros.
- [ ] Añadir cámara/controles móviles completos, colisiones, salto real, animación de caminar y correr.
- [ ] Crear interacción con NPCs, objetivos, puertas, interiores y zonas desbloqueables.
- [ ] Añadir construcción por piezas con vista previa, rotación, coste, límites y guardado.
- [ ] Crear misiones con objetivos verificables, recompensas idempotentes y panel de progreso.

### P2 — Arena y modos
- [ ] Definir salas, equipos, aparición, cuenta regresiva, rondas, marcador y condición de victoria.
- [ ] Implementar objetivos alternos: captura de zonas, escolta, defensa de base, recolección y desafío cooperativo.
- [ ] Sincronizar movimiento/estado de partida en servidor y reconexión.
- [ ] Añadir efectos y animaciones no gráficas; mantener el combate como fantasía estilizada y apta para público familiar.

### P3 — Eras Wars original
- [ ] Crear facciones y mechs originales, sin reutilizar diseños, nombres, logos, modelos ni arte de la franquicia.
- [ ] Implementar colección, rareza, atributos de juego, transformación robot/vehículo y equipo.
- [ ] Construir una base modular que se pueda colocar, mejorar y defender.
- [ ] Añadir expediciones, recursos, desafíos de equipo y mapas con objetivos.
- [ ] Conectar tienda, inventario y equipamiento al mismo sistema persistente de cuenta.

### P4 — Pulido visual y calidad
- [ ] Diseñar estados vacíos, carga, error, éxito, bloqueo y falta de conexión para todas las rutas.
- [ ] Verificar navegación con teclado, lector de pantalla, contraste y pantallas pequeñas.
- [ ] Optimizar modelos, texturas, luces y distancia de dibujado para móviles.
- [ ] Probar flujos completos con cuentas de prueba y datos ficticios antes de publicar.

## Criterio de terminado

Una función solo se marca como terminada cuando se puede usar desde la interfaz, se guarda correctamente, sobrevive a una recarga, se refleja donde corresponde y tiene una prueba que verifica el flujo. Un enlace, una tarjeta visual, una tabla en la base de datos o una ruta API aislada no bastan.
