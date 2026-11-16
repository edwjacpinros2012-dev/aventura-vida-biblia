# Auditoría de juego — Mundo 3D y Campo de Luz

Fecha: 2026-11-16

## Estado observado en el código

### Mundo 3D — `/mundo-3d`
- Existe un escenario Three.js con terreno, camino, río, árboles, casas, cuatro luces coleccionables y un guardián.
- El personaje usa una ilustración oficial en un plano orientado hacia la cámara; todavía no es un modelo 3D riggeado ni tiene animaciones de caminar/idle.
- El movimiento original dependía del teclado. Esta rama incorpora controles táctiles direccionales, salto con gravedad y reinicio de expedición.
- El progreso de las cuatro luces se guarda localmente en el dispositivo; aún no es una misión validada y sincronizada en el servidor.
- No hay todavía sistema de construcción, ciclo día/noche, minimapa, portales entre mundos, guardado de posición ni equipamiento visible.

### Campo de Batalla — `/campo-de-batalla`
- La página actual es un entrenamiento de tres preguntas bíblicas. La temática se presenta como una expedición simbólica.
- No debe confundirse con un campo 3D completo: faltan regiones explorables, personajes con diálogos, objetivos de equipo, desafíos por zona y progreso persistente.
- Mantener la resolución de conflictos en clave de luz, verdad, cooperación y decisiones sabias, sin recrear violencia realista.

### Tienda e inventario — `/tienda` y `/coleccion`
- La tienda principal ya existe en `/tienda`, conectada a cartera, compras e inventario de servidor.
- Hay un segundo panel de colección en `/coleccion`; conviene unificar la experiencia para evitar dos entradas con funciones solapadas.
- Los objetos se registran como propiedad, pero el propio UI indica que equiparlos visualmente en avatares y escenarios aún no está conectado.
- Los artículos semilla incluyen cosméticos, efectos, escenarios y piezas temáticas de armadura; varios son descripciones preparadas para futuras integraciones.

## Próximas entregas recomendadas

1. **Equipamiento real:** añadir un estado de objetos equipados por ranura (casco, pecho, botas, escudo decorativo, efecto y marco); validar propiedad en servidor y reflejarlo en perfil, tienda, colección y Mundo 3D.
2. **Avatar 3D:** mantener los seis personajes oficiales existentes; crear modelos/rigs originales o integrar los recursos 3D autorizados cuando estén disponibles. No sustituirlos por personajes genéricos ni inventar nuevos personajes oficiales.
3. **Mundo vivo:** añadir NPC con diálogos cortos, puntos de interés, mapa/objetivos, animaciones, sonidos con control de volumen, zonas y portales; mantener un modo de rendimiento bajo para móviles.
4. **Misiones persistentes:** crear sesión de mundo y eventos validados por servidor para colección de objetos y recompensas; no confiar en monedas, XP ni resultados enviados por el cliente.
5. **Construcción creativa:** permitir colocar elementos decorativos preaprobados en parcelas seguras, con límites de cantidad y guardado validado.
6. **Campo de Luz cooperativo:** transformar el cuestionario actual en un conjunto de regiones y pruebas cooperativas no violentas, conservando preguntas bíblicas como mecánica de progreso.
7. **Calidad:** probar teclado, táctil, mandos, accesibilidad, reconexión, rendimiento y persistencia en dispositivos reales antes de publicar.

## Referencias de diseño a estudiar (sin copiar contenido protegido)

- **Minecraft:** lectura clara del espacio, exploración, construcción por bloques y objetivos emergentes.
- **Roblox:** experiencias modulares, identidad del jugador y colección/equipamiento de objetos.
- **The Legend of Zelda:** puntos de interés, acertijos ambientales, recompensas legibles y progresión por regiones.
- **Animal Crossing:** espacios acogedores, personalización y actividades de baja presión.
- **LEGO Fortnite / experiencias de construcción cooperativa:** objetivos compartidos y creación de espacios con reglas simples.

Tomar patrones de interacción y diseño; usar arte, nombres, personajes, música y código originales o debidamente autorizados. La temática de robots transformables debe construirse con diseños propios y sin reutilizar modelos, marcas o personajes protegidos sin licencia.

## Criterio de terminado

Una función solo se considera implementada cuando tiene interfaz, lógica real, persistencia adecuada, validación, estados de carga/error/vacío, soporte móvil y una prueba reproducible. Una tarjeta o botón decorativo no cuenta como función terminada.
