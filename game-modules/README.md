# Módulos de juegos internos

Este directorio recibirá los tres minijuegos demostrativos en la Fase 6.

Cada módulo tendrá una clave única registrada en `lib/games/registry.ts` y no podrá acceder a Prisma, secretos, cookies administrativas ni tokens privados. La comunicación con recompensas deberá pasar por rutas de servidor validadas del Game SDK (Fase 4).

Los paquetes HTML5 externos no se alojarán ni ejecutarán aquí como archivos arbitrarios. Si se admiten más adelante, se aislarán en un origen distinto con `iframe sandbox` y un protocolo de mensajes limitado.
