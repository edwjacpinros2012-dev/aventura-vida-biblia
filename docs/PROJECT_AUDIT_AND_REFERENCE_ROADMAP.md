# Auditoría funcional y hoja de ruta — Aventura Vida

Revisión: 16 de noviembre de 2026. Alcance: rama de trabajo `feat/plataforma-web-mundo-3d`.

Este informe separa las funciones existentes de las que están realmente conectadas. Una ruta o tabla en la base de datos no demuestra por sí sola que el jugador pueda completar el flujo.

## Auditoría de lo que se refleja y lo que no

| Área | Confirmado en el código | Brecha que sigue abierta |
| --- | --- | --- |
| Tienda | `/tienda`, catálogo PostgreSQL, saldo de Monedas de Aventura, compra autenticada, libro mayor idempotente e inventario persistente | La compra queda registrada, pero los objetos no tienen todavía un flujo de equipar/quitar ni se renderizan como armadura, ropa, efecto o accesorio en el avatar 2D/3D |
| Navegación móvil | El menú desplegable ya contenía Tienda y Mundo 3D | La barra inferior rápida mostraba solo los primeros cinco enlaces del menú y dejaba fuera Tienda y Mundo 3D. Esta rama ahora fija cinco accesos útiles: Inicio, Juegos, Tienda, Mundo 3D y Misiones, además del Perfil |
| Personajes | Catálogo de personajes oficiales Vida Kids, avatar personalizado y selector global | El mundo 3D usaba una textura fija. Esta rama ahora selecciona la ilustración oficial activa que corresponde al avatar de la cuenta; los avatares CSS personalizados aún requieren una representación 3D equivalente |
| Jardín de la Creación 3D | React Three Fiber, cámara de seguimiento, movimiento en cuatro direcciones, salto, controles táctiles, recolección de luces/madera/piedra y construcción local de cabañas/lámparas | El progreso de recolección y las construcciones siguen guardados en el dispositivo. Falta persistencia de servidor, colisiones y ubicación libre/rotación, interiores, NPCs con misiones guardadas, regiones y modo cooperativo dentro del mundo |
| Campo de batalla | Entrenamiento bíblico interactivo y rutas PvP/multijugador con algunas estructuras de servidor | El entrenamiento bíblico no es una arena 3D. No se deben presentar como terminados los modos que aún no tienen partida de principio a fin, marcador sincronizado, rondas y recompensas verificadas por servidor |
| Multiplayer | Endpoint de salud y un servidor Socket.IO separado; el PR describe modos de Laberinto Bíblico cooperativo y Duelo de preguntas 1 vs 1 | El estado real depende de configurar y alojar el servidor persistente y probar conexiones reales. Un endpoint de salud no sustituye una partida completa |
| Progresión | Perfil, XP, monedas, logros, misiones, catálogo e inventario | Falta conectar recompensas de cada módulo y comprobar que todas las vistas se actualicen desde la misma fuente de datos |

## Cambios adicionales realizados en esta rama

1. Se añadieron Tienda y Mundo 3D a la barra inferior rápida móvil sin quitar los enlaces del menú completo.
2. El personaje del Jardín de la Creación ahora carga la ilustración oficial activa seleccionada por el jugador, en vez de mostrar siempre una textura fija.
3. Se conserva el prototipo avanzado que ya estaba en esta rama: recolección de recursos, construcción local, salto y controles táctiles.

## Referencias de diseño: aprender sistemas, no copiar contenido

Se estudian patrones de juego y arquitectura. No se reutilizan código, mapas, personajes, nombres, logos, ilustraciones, música, textos ni interfaces de otras franquicias.

- **Roblox Creator Hub — Avatar:** un personaje 3D coherente combina geometría, rig, animación, puntos de anclaje y accesorios. Aplicación: cada artículo de tienda necesita una ranura definida y un punto de anclaje; el equipamiento debe acompañar al personaje en perfil, colección, sala y mundo. https://create.roblox.com/docs/avatar
- **Roblox Creator Hub — Layered accessories:** la ropa 3D necesita mesh, rig y ajuste para seguir el movimiento del personaje. Aplicación: no basta con mostrar un icono de armadura; hay que validar el modelo sobre la animación y el cuerpo reales. https://create.roblox.com/docs/avatar/layered-accessories
- **Epic Developer Community — Gameplay devices:** las mecánicas se conectan mediante eventos, condiciones, estados, aparición y recompensas. Aplicación: una arena necesita estados de partida explícitos y reglas verificadas por servidor. https://dev.epicgames.com/documentation/en-us/fortnite/creating-gameplay-with-devices-in-fortnite
- **Supercell Support — Game Modes:** los modos con objetivos distintos mantienen variedad, por ejemplo controlar zonas, escoltar un objetivo o defender una base. Aplicación: crear objetivos cooperativos y competitivos variados, con reglas y mapas propios. https://sc-brawlstars.zendesk.com/hc/en-us/articles/49526599632923-Game-Modes
- **Transformers: Earth Wars — Game Basics:** la experiencia organiza colección de personajes, base, construcción/mejora, objetivos y enfrentamientos. Aplicación para **Eras Wars**: una propuesta original con mechs propios, transformación robot/vehículo, base modular, expediciones, defensa y objetivos por equipo; no copiar personajes ni arte de Transformers. https://tfew.zendesk.com/hc/en-us/articles/4733784011807-Game-Basics

## Hoja de ruta por prioridades

### P0 — Cerrar tienda y equipamiento
- [ ] Añadir ranuras persistentes de equipamiento por categoría.
- [ ] Permitir equipar/quitar solo objetos que pertenecen al jugador.
- [ ] Mostrar armadura, ropa y accesorios en el avatar; mostrar efectos y escenarios donde corresponda.
- [ ] Hacer que la vista previa de tienda refleje el cambio antes de guardar.
- [ ] Probar compra, objeto repetido, saldo insuficiente, nivel bloqueado, recarga y sesión cerrada.
- [ ] Mantener saldo y recompensas validados en servidor; nunca confiar en cantidades enviadas por el cliente.

### P1 — Completar el mundo 3D
- [ ] Sincronizar inventario, recursos, posición y construcciones con la cuenta.
- [ ] Añadir colocación libre, rotación, vista previa, límites, coste y colisiones de construcción.
- [ ] Incorporar animaciones de caminar/correr/saltar y representación 3D de todos los avatares.
- [ ] Crear interiores, puertas, NPCs, diálogos y misiones persistentes.
- [ ] Añadir regiones con objetivos y desbloqueos que se guarden en servidor.

### P2 — Completar arenas y cooperativo
- [ ] Sala, equipos, aparición, cuenta regresiva, rondas, marcador y condición de victoria.
- [ ] Objetivos alternos: captura de zonas, escolta, defensa, recolección y desafíos cooperativos.
- [ ] Sincronización de estado, reconexión, validación del resultado y recompensas idempotentes.
- [ ] Mantener los enfrentamientos estilizados, no gráficos y apropiados para un público familiar.

### P3 — Eras Wars original
- [ ] Diseñar facciones y mechs originales sin nombres, diseños, modelos ni arte de franquicias existentes.
- [ ] Colección con rarezas y atributos de juego equilibrados.
- [ ] Transformación visual robot/vehículo con animaciones.
- [ ] Base modular construible, mejorable y defendible.
- [ ] Expediciones, recursos, desafíos de equipo y mapas de objetivos.
- [ ] Integrar colección, tienda, inventario y equipamiento al mismo sistema de cuenta.

### P4 — Calidad general
- [ ] Ejecutar lint, typecheck, build y pruebas estáticas/E2E.
- [ ] Probar en Android y pantallas pequeñas: controles, rendimiento, lectura y navegación.
- [ ] Añadir estados de carga, error, sin conexión, vacío y éxito en todas las rutas.
- [ ] Optimizar modelos, texturas, luces y distancia de dibujado.
- [ ] No promover a producción hasta que el preview, los tests y las dependencias externas estén verificados.

## Criterio de terminado

Una función solo se considera terminada cuando se puede usar desde la interfaz, se guarda en la fuente correcta, sobrevive a una recarga, se refleja en todas las vistas pertinentes y tiene una prueba que cubre el flujo completo.
