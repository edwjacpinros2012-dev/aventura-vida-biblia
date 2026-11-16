# Referencias de diseño y especificación de construcción — Aventura Vida

Fecha: 16 de noviembre de 2026  
Rama: `feat/plataforma-web-mundo-3d`

Este documento convierte la investigación de referencias en decisiones concretas de producto. No declara funciones como terminadas: cada bloque tiene estado y criterios de aceptación. La implementación debe ampliar el proyecto existente, conservar los 15 juegos, los personajes oficiales y los datos de las cuentas.

## 1. Referencias consultadas y lecciones aplicables

### Diseño de juegos y ciclo principal
- Roblox Creator Hub, Game Design: https://create.roblox.com/docs/production/game-design
  - Lección: diseñar primero un ciclo de juego claro, prototipar y probar la experiencia antes de ampliar sistemas.
  - Aplicación: cada región tendrá una secuencia comprensible: explorar → descubrir un objetivo → resolver una actividad → recibir feedback → desbloquear una nueva ruta.
- Roblox Creator Hub, UI/UX Design: https://create.roblox.com/docs/production/game-design/ui-ux-design
  - Lección: HUD, objetivos, precios y controles deben ayudar al jugador a decidir; la experiencia debe adaptarse al público y al dispositivo.
  - Aplicación: HUD con misión actual, materiales, progreso y botón de ayuda; controles grandes y legibles en móvil; no cubrir el centro de la escena.
- Roblox Creator Hub, Construct Your World: https://create.roblox.com/docs/tutorials/curriculums/environmental-art/construct-your-world
  - Lección: un mundo coherente necesita composición, biblioteca de recursos y elementos ambientales que orienten al jugador.
  - Aplicación: cada región tendrá siluetas reconocibles, caminos, hitos visuales, iluminación propia y puntos de interés, no solo objetos dispersos.

### Rendimiento 3D web
- React Three Fiber, Performance Pitfalls: https://r3f.docs.pmnd.rs/advanced/pitfalls
  - Lección: reutilizar geometrías y materiales, evitar montar/desmontar objetos continuamente, usar instancing cuando se repiten elementos y no llamar setState en cada frame.
  - Aplicación: árboles, rocas, flores y cristales repetidos deben compartir recursos o usar instanced meshes; las actualizaciones de movimiento permanecen en useFrame y el estado React cambia solo ante eventos de juego.
- React Three Fiber, Scaling Performance: https://r3f.docs.pmnd.rs/advanced/scaling-performance
  - Lección: reutilizar assets cargados, reducir draw calls y bajar temporalmente la calidad de efectos cuando el dispositivo lo necesite.
  - Aplicación: cargar modelos GLB optimizados, reutilizar materiales, limitar sombras y partículas en móviles y probar el mundo en dispositivos modestos.
- Drei, MeshReflectorMaterial: https://drei.docs.pmnd.rs/shaders/mesh-reflector-material
  - Lección: las superficies pueden reflejar el entorno con un render target cuya resolución y desenfoque se ajustan al presupuesto gráfico.
  - Aplicación: el río del Jardín usa una reflexión de resolución 128 para que el agua refleje el valle sin activar un efecto de máxima calidad.
- React Three Fiber, Introduction: https://r3f.docs.pmnd.rs/
  - Lección: React Three Fiber es un renderer de Three.js y la versión 9 corresponde a React 19.
  - Aplicación: mantener las versiones compatibles ya declaradas por el proyecto; no actualizar Three/Fiber/Drei sin revisar lockfile, build y Preview.

### Transformación y diseño de modos
- GameSpot, Transformers: War for Cybertron review: https://www.gamespot.com/reviews/transformers-war-for-cybertron-review/1900-6267012/
- PC Gamer, Transformers: War for Cybertron review: https://www.pcgamer.com/transformers-war-for-cybertron-review/
- Entrevista de desarrollo: https://www.worthplaying.com/article/2010/3/17/interviews/73111-transformers-war-on-cybertron-all-developer-interview/
  - Lección: la transformación solo aporta profundidad si cada forma tiene utilidad clara y si el nivel ofrece situaciones que hacen natural alternar entre ambas.
  - Aplicación a Eras Wars: robot para activar terminales, ayudar a personajes, manipular mecanismos y recorrer espacios precisos; vehículo para desplazarse por rutas amplias, cruzar zonas y completar pruebas de tiempo. No basta con un botón que cambie la apariencia.
  - Límite creativo: crear mechs, nombres, siluetas, emblemas, vehículos, escenarios, sonidos y animaciones originales. No reutilizar personajes, logos, modelos, mapas, música ni arte de Transformers.

## 2. Diagnóstico confirmado del estado actual

| Sistema | Estado confirmado | Siguiente trabajo |
| --- | --- | --- |
| Jardín 3D | Valle con cámara de seguimiento, sprite oficial, movimiento, salto, controles táctiles, minimapa en vivo, río reflectante, luces, madera, piedra, cabañas y lámparas | Colisiones, interacción contextual, colocación libre, guardado de cuenta y más regiones |
| Personaje | Selecciona la ilustración oficial según el avatar; accesorios geométricos de prueba | Modelo 3D riggeado, animaciones, puntos de anclaje y vista previa de equipamiento |
| Recursos | Recolección y contadores en localStorage | API autenticada, persistencia PostgreSQL e idempotencia para no duplicar recolecciones |
| Construcción | Piezas decorativas en posiciones calculadas automáticamente | Modo colocar, rotar, confirmar, cancelar y retirar; validar materiales en servidor |
| Tienda | Compra e inventario existentes; ranuras de equipamiento y acciones de equipar/quitar incorporadas en la rama | Vista previa real del artículo y pruebas de extremo a extremo |
| Eras Wars | Concepto/hoja de ruta, no juego 3D terminado | Prototipo independiente con dos formas originales y objetivos de exploración |
| Multijugador | Laberinto cooperativo y duelo bíblico de preguntas en servidor separado | No anunciar mundo 3D multijugador hasta alojar el servidor y probar sincronización real |
| Producción | PR #2 está abierto como borrador; la rama está divergida respecto de main | Resolver dos commits de diferencia, recuperar lockfile reproducible y validar variables de entorno/migraciones |

## 3. Especificación de la siguiente versión del Jardín 3D

### Prioridad A — Interacción legible
1. [x] Añadido minimapa sencillo con posición del jugador y luces que faltan por recoger; el marcador se actualiza con una referencia DOM para evitar renderizar React en cada frame.
2. Convertir el diálogo del guardián en una misión con estados: no iniciada, activa y completada.
3. Mostrar objetivos breves en HUD y un mensaje de ayuda que se pueda cerrar.
4. Añadir colisiones básicas para evitar atravesar casas, árboles grandes y límites del valle.
5. Mantener controles teclado/táctil y añadir pausa/reanudar.
6. [x] Añadido material reflectante de baja resolución al río para reflejar el entorno con un coste gráfico acotado.

Criterios de aceptación:
- El jugador entiende cómo moverse en menos de un minuto.
- El minimapa y el HUD no bloquean los controles táctiles.
- No se puede completar una misión solo enviando una petición arbitraria desde el navegador.
- La escena no pierde el personaje oficial seleccionado.

### Prioridad B — Construcción real
1. Activar modo construcción desde un botón.
2. Mostrar una previsualización translúcida de la pieza antes de colocarla.
3. Permitir girar, confirmar y cancelar.
4. Comprobar materiales y límites de construcción en servidor.
5. Guardar piezas por cuenta; mantener una copia local solo como caché.
6. Permitir retirar una pieza y devolver materiales según una regla fija y validada.

Criterios de aceptación:
- Dos dispositivos de la misma cuenta muestran las mismas construcciones.
- Reintentar la misma operación no duplica piezas ni materiales.
- El cliente no decide el saldo definitivo.
- Si la conexión falla, se informa al jugador y no se presenta como guardado un cambio que no llegó al servidor.

### Prioridad C — Personaje y equipamiento
1. Mantener los personajes oficiales Vida Kids como identidad visual.
2. Incorporar un modelo humanoide 3D original con rig compatible.
3. Definir anclajes separados para cabeza, torso, espalda, compañero y efecto.
4. Mapear cada artículo de tienda a un modelo compatible y una ranura.
5. Mostrar vista previa antes de equipar y reflejar el cambio en el mundo.
6. Si un artículo no tiene modelo, mostrarlo como coleccionable y no prometer que se puede llevar puesto.

Criterios de aceptación:
- Accesorios siguen el rig durante caminar, saltar y girar.
- No atraviesan visiblemente el cuerpo en poses principales.
- El artículo equipado se obtiene desde la API de cuenta, no desde una lista local manipulable.

## 4. Especificación original de Eras Wars

Eras Wars debe sentirse como una aventura de mechs de ciencia ficción con identidad propia, no como una copia de una franquicia existente.

### Fantasía central
Exploradores mecánicos de dos formas que recorren regiones, rescatan unidades amistosas, reparan instalaciones y compiten en pruebas de equipo. La transformación debe resolver problemas del nivel.

### Formas y controles
- Forma robot: caminar, saltar, interactuar con terminales, transportar objetos ligeros y activar mecanismos.
- Forma vehículo: desplazamiento rápido por rutas preparadas, rampas suaves y circuitos de exploración.
- Transformación: animación breve, clara y cancelable solo en zonas seguras; la cámara y los controles deben conservar orientación.
- Móvil: botones grandes para movimiento, salto, interacción y cambio de forma; evitar combinaciones complejas.

### Modos iniciales no violentos
1. Carrera de energía: recorrer una ruta y activar puntos de control.
2. Rescate de drones: encontrar unidades amistosas y llevarlas a una zona segura.
3. Reparación de reactor: buscar piezas y resolver una secuencia lógica.
4. Captura de balizas: coordinar al equipo para activar y mantener puntos de energía.
5. Defensa de estación: resolver tareas de reparación y activar barreras protectoras antes de que termine el tiempo.

### Progresión
- Desbloqueo cosmético por logros de exploración.
- Mejoras de movilidad que cambian rutas disponibles, no ventajas injustas.
- Colección de planos y piezas visuales.
- Misiones cooperativas con objetivos y puntuación calculados por servidor.
- Sin compras con dinero real en esta fase; la tienda usa únicamente la economía virtual ya existente y debe respetar sus validaciones.

### Alcance de la primera demo
- Un mech original.
- Dos formas visuales diferenciadas.
- Una región pequeña y reconocible.
- Un circuito de vehículo y una terminal que requiere forma robot.
- Tres objetivos de exploración.
- Controles de teclado y táctiles.
- Sin multijugador 3D hasta que la demo individual sea estable.

## 5. Arquitectura técnica y seguridad de progreso

- La base de datos debe ser fuente de verdad para inventario, recursos, construcciones, misiones y recompensas.
- Cada acción que consume o concede recursos necesita una clave de idempotencia.
- Validar autenticación, propiedad, límites de cantidad y costes en servidor.
- El cliente puede previsualizar una acción, pero no decidir el saldo final.
- Guardar cambios con transacciones cuando una operación afecta a más de una tabla.
- No incluir secretos, tokens, direcciones privadas ni identificadores personales en el cliente.
- Para jugadores jóvenes, mantener chat limitado, reportes, controles de privacidad y contenidos no gráficos.

## 6. Orden de implementación

1. Resolver la integración técnica de la rama: recuperar lockfile pnpm reproducible, sincronizar con los dos commits recientes de main y volver a ejecutar lint, typecheck y build.
2. Probar la tienda y equipamiento con cuentas de prueba y migración revisada.
3. Mejorar el Jardín 3D con minimapa, misión contextual y colisiones.
4. Diseñar contrato de servidor para recursos y construcciones antes de conectar persistencia.
5. Crear prototipo separado de Eras Wars con robot/vehículo y objetivos de exploración.
6. Añadir modelos riggeados solo cuando los assets originales estén listos.
7. Ejecutar pruebas móviles, pruebas de cuenta y pruebas de regresión de los 15 juegos.
8. Promover a producción únicamente después de Preview READY, migración verificada y configuración de base/autenticación confirmada.

## 7. Lista de verificación de salida

- [ ] Lockfile pnpm sincronizado y reproducible con instalación congelada.
- [ ] Rama sincronizada con main sin pérdida de cambios.
- [ ] Lint y TypeScript aprobados.
- [ ] Build de producción aprobado.
- [ ] Migración revisada y aplicada con respaldo y verificación.
- [ ] Tienda, inventario y equipamiento probados.
- [ ] Las 15 fichas abren su módulo correcto.
- [ ] Personajes oficiales conservados.
- [ ] Jardín 3D probado en móvil y escritorio.
- [ ] Variables de producción configuradas sin exponer sus valores.
- [ ] Preview comprobada antes de promover a producción.
