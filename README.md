# Aventura Vida

Plataforma web de juegos, misiones y aventuras para **Proyecto Vida Kids**. Esta entrega implementa exclusivamente la **Fase 1**: arquitectura, sistema visual, páginas públicas, catálogo navegable, datos de demostración y base PostgreSQL/Prisma preparada para las siguientes fases.

## Incluye

- Inicio público responsive con hero, misión diaria, aventura destacada, novedades y progreso de muestra.
- Catálogo de juegos con búsqueda, filtros por categoría/dificultad/edad y vistas de nuevos/populares.
- Fichas individuales de juego, rutas de aventuras, misión diaria, ranking seguro por apodo y perfil de muestra.
- Sistema visual original: no usa personajes ni recursos de franquicias de terceros.
- Esquema Prisma para usuarios, perfiles, juegos, sesiones, progreso, puntuaciones, XP, misiones, logros, aventuras, recompensas, notificaciones, configuración y auditoría.
- Semilla con contenido y usuarios enteramente ficticios.
- Registro de módulos de juegos y contratos de Game SDK preparados, sin ejecutar aún minijuegos ni recompensas.

## Stack

- Next.js (App Router), React y TypeScript estricto
- Tailwind CSS
- PostgreSQL y Prisma

## Ejecutar localmente

1. Instala Node.js 20.9 o posterior y PostgreSQL 15 o posterior.
2. Copia el archivo de entorno:

   ```bash
   cp .env.example .env
   ```

   En Windows PowerShell: `Copy-Item .env.example .env`

3. Actualiza `DATABASE_URL` en `.env` con tu base de datos local.
4. Instala dependencias:

   ```bash
   pnpm install
   ```

   También puedes usar `npm install` si esa es tu herramienta habitual.

5. Genera el cliente y crea la base de datos:

   ```bash
   pnpm db:generate
   pnpm db:migrate --name init
   pnpm db:seed
   ```

6. Arranca el sitio:

   ```bash
   pnpm dev
   ```

   Abre [http://localhost:3000](http://localhost:3000).

## Verificar calidad

```bash
pnpm lint
pnpm typecheck
pnpm build
```

## Rutas implementadas en Fase 1

| Ruta | Estado |
| --- | --- |
| `/` | Implementada |
| `/juegos` y `/juegos/[slug]` | Implementadas |
| `/aventuras` y `/aventuras/[slug]` | Implementadas como estructura de contenido |
| `/mision` | Implementada como demostración de misión diaria |
| `/ranking` | Implementada con apodos ficticios y sin datos privados |
| `/perfil` | Implementada como perfil de muestra |

## Pendiente de Fases 2–7

- Autenticación, registro, perfiles persistentes y roles del servidor.
- `/admin` protegido y CRUD de juegos/categorías/contenido.
- Game SDK, sesiones, validación de puntuaciones, XP y logros reales.
- Minijuegos de memoria, preguntas y recolector de luz.
- Misiones programadas, rankings reales, PWA, pruebas de seguridad y optimizaciones finales.

No se muestran botones de juego que finjan otorgar puntos: las fichas indican claramente el estado de los contenidos aún pendientes.

## Documentación de diseño

- [Plan de Fase 1](PLAN.md)
- [Arquitectura y decisiones técnicas](ARCHITECTURE.md)
- [Contratos previstos del Game SDK](lib/game-sdk/contracts.ts)
