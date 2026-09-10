# Plan de desarrollo — Aventura Vida

## Alcance actual: Fase 1

Construir la base pública de la plataforma: identidad visual, navegación adaptable, inicio, catálogo de juegos, detalle de juego, datos de demostración y una base de datos preparada para el crecimiento posterior.

## Entregables de esta fase

1. Aplicación Next.js con TypeScript estricto, App Router y Tailwind CSS.
2. Sistema de diseño reutilizable y accesible para Aventura Vida.
3. Rutas públicas: inicio, juegos, detalle de juego, aventuras, misión, ranking y perfil de demostración.
4. Catálogo con búsqueda y filtros ejecutados en el cliente sobre datos de demostración.
5. Esquema Prisma/PostgreSQL y semilla de desarrollo, sin autenticación todavía.
6. Estructura de módulos preparada para juegos internos y para un Game SDK futuro.
7. README, variables de entorno de ejemplo y verificación de lint/typecheck/build.

## Fuera de alcance — explícitamente pendiente

- Inicio de sesión, registro y control de roles real.
- Panel administrativo funcional y CRUD persistente.
- Guardado de progreso, XP, puntos, misiones y rankings reales.
- Ejecución de minijuegos y Game SDK operativo.
- PWA, notificaciones, subida de archivos y paquetes de juegos externos.

## Secuencia

1. Documentar decisiones y modelo de datos.
2. Inicializar el proyecto y el sistema de diseño.
3. Implementar las rutas y componentes de Fase 1 con contenido demo.
4. Añadir esquema Prisma y seed.
5. Ejecutar verificaciones y corregir incidencias.
