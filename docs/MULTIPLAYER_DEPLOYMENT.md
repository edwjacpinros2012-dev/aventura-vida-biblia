# Despliegue del servidor multijugador

## Lo que ya existe

El repositorio ya contiene un servidor persistente Socket.IO (`server/multiplayer-server.ts`), salas cooperativas, sincronización de estado, chat de frases predefinidas y un modo PvP 1 vs 1 de preguntas. También existe una verificación automatizada con dos clientes y pruebas de salas de hasta cuatro participantes.

Vercel aloja la aplicación Next.js, pero no debe alojar este proceso Socket.IO como una función serverless de larga duración. El servidor se despliega como un servicio Node independiente.

## Preparación incluida

- `render.yaml` define un servicio web Node con comprobación `/health`.
- El servidor ahora respeta `PORT` del proveedor de hosting y mantiene `MULTIPLAYER_PORT` como override local.
- El comando de inicio es `pnpm multiplayer:dev`.
- El servicio usa `DATABASE_URL` como variable secreta; debe apuntar a la misma base PostgreSQL que usa la web.

## Activación manual necesaria

1. En el proveedor de hosting, crea un servicio desde el Blueprint `render.yaml` de esta rama. Revisa el plan y las condiciones antes de confirmar; el plan gratuito puede suspender servicios inactivos y no garantiza partidas siempre disponibles.
2. Configura `DATABASE_URL` como secreto del servicio. No lo pegues en GitHub ni en el navegador.
3. Cuando el proveedor entregue la URL HTTPS del servidor, configura en Vercel Production y Preview ambas variables con la misma URL: `NEXT_PUBLIC_MULTIPLAYER_SERVER_URL=https://URL-DEL-SERVIDOR` (conexión Socket.IO desde el navegador) y `MULTIPLAYER_SERVER_URL=https://URL-DEL-SERVIDOR` (sondeo privado de `/api/multiplayer/health`, sin exponer la URL desde esa API).
4. Configura `MULTIPLAYER_ALLOWED_ORIGIN` en el servicio para permitir únicamente los dominios reales de la web.
5. Reinicia el servicio y verifica `https://URL-DEL-SERVIDOR/health`.
6. En el centro `/multiplayer`, pulsa **Revisar** y confirma el estado online; la API de salud usa timeout y no revela la URL configurada.\n7. Ejecuta desde un entorno con acceso de red al servidor: `MULTIPLAYER_VERIFY_URL=https://URL-DEL-SERVIDOR pnpm multiplayer:verify`.

## Limitaciones que deben resolverse antes de producción

- La cola y estado de los duelos PvP se mantienen en memoria del proceso; las tablas guardan resultados, pero no sustituyen un sistema de matchmaking distribuido. Para escalar a varias instancias se necesita Redis/adaptador Socket.IO y una cola persistente.
- Confirmar que las migraciones Prisma de salas, participantes, partidas y perfiles ya están aplicadas en la base compartida.
- Revisar cookies/sesiones cross-origin con el dominio definitivo y probar reconexión en móvil.
- El servidor debe tener límites de conexión, monitorización, copias de seguridad y política de moderación probada.
- El modo VS actual implementado es un duelo de preguntas 1 vs 1; no es todavía combate 3D sincronizado.

## IA central

La IA editorial existe en el backend y genera borradores estructurados para el juego de preguntas, no crea automáticamente juegos ejecutables completos. Solo se activa con `OPENAI_API_KEY` en el entorno servidor y sus propuestas requieren aprobación humana. Ampliar la IA a capítulos, niveles de laberinto y eventos requiere adaptadores de juego, validadores de servidor y pantallas editoriales para cada tipo.