# Módulos de juegos internos

Los ocho minijuegos internos actuales se resuelven desde `components/games/` a
través de `GamePlayer`. Este directorio queda reservado para una futura
separación de módulos autocontenidos cuando el Game SDK de servidor esté listo.

Cada módulo tiene una clave única registrada en `lib/games/registry.ts` y no
puede acceder a Prisma, secretos, cookies administrativas ni tokens privados.
Por ahora las recompensas se muestran como demostración y se guardan localmente;
la versión de producción deberá comunicarse mediante rutas validadas del Game SDK.

Los paquetes HTML5 externos no se alojarán ni ejecutarán aquí como archivos arbitrarios. Si se admiten más adelante, se aislarán en un origen distinto con `iframe sandbox` y un protocolo de mensajes limitado.
