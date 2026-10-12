# Persistencia, modo offline y automatización diaria

## PostgreSQL

La aplicación usa PostgreSQL mediante Prisma. Copia `.env.example` a `.env` y
configura una URL local real, sin añadirla a Git:

```text
DATABASE_URL="postgresql://USUARIO:CONTRASENA@HOST:5432/aventura_vida?schema=public"
```

Antes de usar cuentas, economía, PvP, inventario o contenido diario en una
base nueva, ejecuta desde una terminal con acceso a esa base:

```bash
pnpm db:generate
pnpm db:deploy
pnpm db:status
pnpm db:seed # solo para desarrollo; añade datos ficticios
```

`db:deploy` aplica migraciones existentes; no reinicia datos. Si una base
existente no tiene historial de Prisma, inspecciónala y registra una línea de
base con `prisma migrate resolve` antes de aplicar nada.

## Cron diario

`vercel.json` programa `GET /api/cron/daily-content` a las **10:00 UTC**
(05:00 Ecuador continental) cada día. Vercel debe soportar Cron para el plan y
proyecto usados. La ruta exige:

```text
CRON_SECRET="un-secreto-largo-y-aleatorio"
DATABASE_URL="..."
```

Vercel Cron usa `Authorization: Bearer <CRON_SECRET>`. Para una ejecución
manual segura, usa el mismo encabezado hacia `POST /api/cron/daily-content`.
No pruebes el secreto desde el navegador ni lo incluyas en código cliente.

Cada ejecución usa la llave `daily-bible-content + fecha Ecuador`. La tabla
`ContentGenerationRun` evita publicaciones dobles y registra intento, estado,
error y salida. `GeneratedContent` conserva contenido, versión, validación,
origen, revisión y publicación. La repetición de una ejecución completada
devuelve `already-processed` y no crea otra misión.

Por ahora, la publicación automática usa únicamente la rotación de plantillas
bíblicas curadas en `lib/daily-bible-challenge.ts`. No hay proveedor de IA
configurado. Cuando se conecte uno, se debe usar solo en backend y guardar su
resultado como `DRAFT`; un moderador debe aprobarlo mediante
`/api/admin/content` antes de publicarlo.

## Offline-first

El service worker precarga la carcasa de inicio y guarda de forma dinámica:

- páginas y recursos que el jugador ya abrió;
- `/api/content/offline`, que contiene el catálogo público y el reto diario;
- la pantalla de recuperación `/offline`.

`IndexedDB` guarda el último paquete público y la cola de progreso para una
cuenta. La cola contiene solo estado de juego no premiable (por ejemplo, nivel
abierto de un laberinto); no incluye contraseñas, cookies, tokens, XP, puntos,
monedas, logros ni recompensas.

Al recuperar conexión, `POST /api/progress/sync` valida la sesión, el juego y
el tamaño del payload. Cada operación lleva UUID y queda en
`OfflineSyncOperation`; repetirla es idempotente. Los saldos y premios siguen
las rutas y transacciones de economía/PvP del servidor.

El contenido nuevo no puede generarse sin conexión. Un dispositivo puede jugar
solo el contenido y recursos que descargó previamente. Antes de activar esta
función para familias, prueba instalación, desconexión, reconexión y un cambio
de versión de service worker en navegadores Android, iOS, tablet y escritorio.
