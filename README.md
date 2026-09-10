# Aventura Vida

Plataforma web de juegos, misiones y aventuras para **Proyecto Vida Kids**. Incluye la base pública de Fase 1 y ocho minijuegos bíblicos internos para probar la experiencia de juego.

## Incluye

- Inicio público responsive con hero, misión diaria, aventura destacada, novedades y catálogo navegable.
- Catálogo de juegos con búsqueda, filtros por categoría/dificultad/edad y vistas de nuevos/populares.
- Fichas individuales, rutas de aventuras, misión diaria, ranking por apodo y perfil de jugador local.
- Ocho minijuegos funcionales: Sopa de Letras, Colorear, Preguntas Bíblicas, Historias Interactivas, Memoria, IQ Bíblico, Aprende el Versículo y Rompecabezas.
- Shell común de juego con pantalla de carga/error/victoria, puntos, XP, racha, progreso, logros, partidas completadas y versículos aprendidos, guardado localmente por navegador.
- Sistema visual original: no usa personajes ni recursos de franquicias de terceros.
- Esquema Prisma para usuarios, perfiles, juegos, sesiones, progreso, puntuaciones, XP, misiones, logros, aventuras, recompensas, notificaciones, configuración y auditoría.
- Semilla con contenido y usuarios enteramente ficticios.
- Registro de módulos internos y contratos de Game SDK para sustituir las recompensas locales por validación de servidor.

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
| `/juegos`, `/juegos/[slug]` y `/juegos/[slug]/jugar` | Implementadas |
| `/aventuras` y `/aventuras/[slug]` | Implementadas como estructura de contenido |
| `/mision` | Implementada como demostración de misión diaria |
| `/ranking` | Implementada con apodos ficticios y puntuación local del jugador |
| `/perfil` | Implementada con progreso local y sin datos personales |

## Pendiente de Fases 2–7

- Autenticación, registro, perfiles persistentes y roles del servidor.
- `/admin` protegido y CRUD de juegos/categorías/contenido.
- Game SDK de servidor, sesiones autenticadas y validación de puntuaciones, XP y logros reales.
- Misión diaria automática y recompensas verificadas. Los minijuegos ya disponibles guardan sólo en este navegador.
- Misiones programadas, rankings reales, PWA, pruebas de seguridad y optimizaciones finales.

Los cuatro juegos heredados que todavía no tienen módulo se muestran claramente como próximos; no otorgan puntos ni fingen estar disponibles.

## Documentación de diseño

- [Plan de Fase 1](PLAN.md)
- [Arquitectura y decisiones técnicas](ARCHITECTURE.md)
- [Contratos previstos del Game SDK](lib/game-sdk/contracts.ts)
