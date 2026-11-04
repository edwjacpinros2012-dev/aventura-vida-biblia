# PWA, sincronización y Android

## Instalar la plataforma

La URL pública canónica se configura con `NEXT_PUBLIC_APP_URL`; el respaldo
seguro del código es `https://aventura-vida-biblia.vercel.app`. La plataforma
completa se comparte desde el botón **Compartir Aventura Vida Biblia**: emplea
Web Share cuando el navegador lo soporta y ofrece el enlace HTTPS de WhatsApp.
No comparte perfiles, misiones individuales ni una dirección `localhost`.

Después de desplegar por HTTPS, Chrome y Edge suelen mostrar **Instalar** o
**Añadir a pantalla de inicio**. En Safari para iPhone/iPad se instala desde el
menú Compartir del navegador. La instalación depende del navegador, el origen
HTTPS y sus políticas; debe probarse en cada familia de dispositivos.

El manifiesto y el service worker almacenan la carcasa pública, recursos ya
visitados y el paquete público de contenido. Las vistas de perfil, economía,
PvP, multijugador y administración no se guardan como HTML en la caché para
evitar mostrar datos de una cuenta previa en un dispositivo compartido.

## Sin conexión y reintento

Sin conexión se puede abrir el contenido público descargado previamente y los
juegos compatibles. IndexedDB conserva el último paquete público y el avance
no premiable de una cuenta. Al volver la red, la PWA identifica la cuenta de la
sesión y envía únicamente las operaciones con ese `accountId`. El servidor usa
el identificador UUID de la operación para aplicar o reconocer una repetición
sin duplicar el avance. XP, puntos, Monedas de Aventura, logros y recompensas
no se conceden desde esa cola: siguen siendo decisiones del servidor.

No hay prueba E2E de una instalación física ni de una pérdida real de red en
este repositorio. Antes de producción se debe instalar en Android, iOS y un
equipo de escritorio, jugar contenido previamente abierto sin red, reconectar y
comprobar en PostgreSQL que una operación se registró una única vez.

## Actualizaciones

`public/sw.js` usa una versión de caché. Al publicar una nueva versión, el
service worker la detecta al abrir la PWA, activa la nueva carcasa y recarga una
vez la pestaña controlada. Los nuevos capítulos o misiones se descargan cuando
el dispositivo recupera conexión. No se elimina IndexedDB durante esa
actualización, por lo que no se deben perder partidas locales pendientes.

## APK Android

No se generó un APK en este entorno: no hay JDK, Android SDK, Gradle, ADB ni un
proyecto Android (Capacitor o Trusted Web Activity) configurado. La PWA sigue
siendo instalable desde un navegador compatible, pero no es un APK.

Cuando se autorice una envoltura Android y haya un equipo con el SDK instalado,
una opción es Capacitor:

```bash
pnpm add @capacitor/core @capacitor/android
pnpm add -D @capacitor/cli
pnpm exec cap init "Aventura Vida Biblia" "com.aventuravidabiblia.app"
pnpm exec cap add android
pnpm run build
pnpm exec cap sync android
```

Después, desde la carpeta `android/`, Gradle puede generar un APK de depuración
en una ruta similar a `android/app/build/outputs/apk/debug/app-debug.apk`. Esa
ruta no existe todavía y no debe comunicarse como artefacto creado hasta que un
build de Android la produzca y se pruebe en un dispositivo.
