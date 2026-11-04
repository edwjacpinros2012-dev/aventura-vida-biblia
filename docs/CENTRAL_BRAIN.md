# Cerebro central editorial

El cerebro central se ejecuta únicamente en el servidor y es compartido por
la web y la PWA a través de las mismas rutas de contenido. No se ejecuta en el
navegador ni recibe la clave de OpenAI.

## Integraciones actuales

- Lee el reto diario bíblico curado.
- Lee el catálogo real de módulos internos jugables y el listado real de
  aventuras para limitar los destinos de cada propuesta.
- Envía una propuesta estructurada al proveedor opcional de IA.
- Valida estructura, referencia bíblica curada, edades, recompensas y destinos.
- Convierte únicamente `QUIZ_DRAFT` aprobado para **Preguntas Bíblicas** en un
  paquete ejecutable: sus preguntas se incorporan al juego existente mediante
  `/api/content/games/preguntas-de-aventura`. Otros tipos quedan en revisión
  hasta que exista un adaptador jugable específico.
- La ejecución automática solicita solo `QUIZ_DRAFT` mientras los adaptadores
  de Memoria, Sopa de Letras, Laberinto, Versículos y Aventuras se encuentran
  pendientes. También limita el destino a **Preguntas Bíblicas**, el único
  módulo que actualmente puede consumir esos packs. Así no se publican como
  jugables tipos o destinos que aún no lo son.
- Guarda la salida como `GeneratedContent` en estado `DRAFT` a través de la
  automatización diaria existente.
- Usa la consola editorial protegida para revisar, aprobar o rechazar. Una
  propuesta de IA no puede publicarse sin convertirse primero en contenido
  jugable revisado.
- El panel privado permite pausar o reanudar la generación editorial de IA.

## Límites intencionales

El cerebro no tiene permisos para leer perfiles privados, cambiar avatares,
otorgar XP/puntos/Monedas de Aventura, cambiar inventarios, resolver PvP,
controlar salas, aplicar sanciones ni modificar permisos. Esas operaciones
permanecen en los servicios de servidor existentes y requieren sus propias
validaciones e idempotencia.

## Automatización

`/api/cron/daily-content` publica el reto de plantilla validada y, cuando
`OPENAI_API_KEY` está configurada, prepara como máximo una propuesta de IA por
fecha. La propuesta no puede sustituir el reto curado si falla. Los reintentos
están limitados y las ejecuciones se registran en `ContentGenerationRun`.

Para habilitarlo fuera de desarrollo se requiere `DATABASE_URL`, `CRON_SECRET`
y `OPENAI_API_KEY` como variables privadas del entorno de producción, además
de un despliegue con el cron de `vercel.json` activo. La presencia del archivo
no prueba por sí sola que Vercel haya ejecutado el cron.
