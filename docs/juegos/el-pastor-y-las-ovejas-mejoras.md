# El Pastor y las Ovejas — plan de mejora

> Documento de diseño para evolucionar el prototipo HTML Canvas compartido por el usuario. Este documento no afirma que las mejoras ya estén implementadas.

## Regla principal: conservar los avatares originales

- Usar los avatares que ya existen en los materiales del proyecto.
- No rediseñarlos, sustituirlos ni inventar versiones nuevas.
- Mantener sus nombres, aspecto, colores y personalidad.
- Antes de integrar, localizar los archivos originales de cada avatar y usarlos como referencia visual.
- Si falta un archivo, dejar una referencia pendiente; no reemplazarlo con un personaje provisional sin autorización.

## Objetivo

Convertir el prototipo **El Pastor y las Ovejas** en un juego infantil educativo, pulido y ampliable. La primera versión debe ser jugable de principio a fin, con controles táctiles y teclado, objetivos claros, progreso guardado y niveles que se puedan completar.

## Mecánicas que se conservan del prototipo de Géminis

- Carrera lateral con desplazamiento del escenario.
- Salto y salto doble.
- Rescate de ovejas.
- Recolección de estrellas.
- Vocal objetivo A, E, I, O, U.
- Pronunciación en español mediante voz del navegador/dispositivo cuando esté disponible.
- Estación educativa con vagones para ordenar o reconocer las cinco vocales.
- Selector de avatares, respetando los diseños originales.
- HUD con vidas, ovejas, estrellas y objetivo actual.

## Mejoras jugables

### 1. Controles y accesibilidad
- Teclado: espacio/flecha arriba para saltar.
- Móvil/tablet: botón táctil grande y compatible con pulsación sostenida.
- Ajustar tamaño de interfaz y zonas táctiles a pantallas pequeñas.
- Pausa, reanudar y reiniciar nivel.
- Instrucciones visuales breves antes del primer nivel.

### 2. Aprendizaje de vocales
- Mostrar la vocal objetivo en grande y pronunciarla claramente.
- Al rescatar una oveja, asociar la vocal con una palabra e imagen.
- Añadir repetición de pronunciación y opción de escuchar otra vez.
- Estación final con cinco vagones: arrastrar o seleccionar las vocales en orden.
- Dar retroalimentación amable; los errores enseñan y permiten volver a intentar.

### 3. Niveles y escenarios
- Nivel 1: pradera de bienvenida y vocales.
- Nivel 2: camino del bosque con plataformas y ovejas.
- Nivel 3: puente sobre el río con obstáculos sencillos.
- Nivel 4: colinas y cuevas con rutas alternativas.
- Cada escenario debe tener inicio, meta, objetivo de rescate y pantalla de resultados.
- Aumentar la dificultad gradualmente, sin castigar de forma excesiva a los niños.

### 4. Progresión y recompensas
- Guardar nivel alcanzado, estrellas y vocales aprendidas.
- Otorgar medallas por completar objetivos educativos.
- Desbloquear niveles por progreso.
- No exigir compras ni pagos para completar el aprendizaje.
- Permitir repetir niveles y practicar sin límite.

### 5. Presentación y sonido
- Animaciones diferenciadas para correr, saltar, aterrizar, celebrar y recibir daño.
- Efectos de sonido suaves para saltos, rescates y recompensas.
- Música opcional con control de volumen y silencio.
- Fondos con profundidad visual, nubes, vegetación, agua y elementos animados.
- Mantener textos grandes, legibles y apropiados para niños.

## Pantallas necesarias

1. Menú principal.
2. Selección de avatar (con los avatares existentes).
3. Selección de nivel.
4. Juego en curso (HUD).
5. Estación de vocales.
6. Pausa.
7. Resultados del nivel.
8. Colección de medallas y progreso.

## Criterios de aceptación

- El proyecto abre y se puede ejecutar desde el motor/plataforma elegida.
- El jugador puede comenzar, jugar, pausar, completar y repetir un nivel.
- Los controles funcionan con teclado y pantalla táctil.
- Las cinco vocales se muestran y se pronuncian en español cuando el dispositivo lo permite.
- Se pueden rescatar ovejas y completar la estación de vocales.
- El progreso se conserva al cerrar y volver a abrir el juego.
- Los avatares son los originales del proyecto, sin sustituciones.
- No se declara una función como terminada hasta haberla probado.

## Ruta técnica sugerida

1. Localizar y catalogar los archivos originales de avatares y recursos gráficos.
2. Recuperar el prototipo HTML/Canvas como referencia funcional.
3. Definir una primera versión vertical completa: menú → nivel 1 → estación de vocales → resultados → guardado.
4. Probar controles en PC y móvil.
5. Añadir escenarios y niveles gradualmente.
6. Si se lleva a Godot 4, crear un proyecto ejecutable con escenas y scripts reales; no basta con documentación o archivos sueltos.
7. Mantener separada la lógica de progreso para poder conectarla más adelante con la plataforma Aventura Vida Biblia.

## Alcance de este cambio en GitHub

Este commit agrega el documento de diseño y los criterios de aceptación. **No integra todavía el prototipo, no modifica los avatares y no constituye una versión jugable del juego.**
