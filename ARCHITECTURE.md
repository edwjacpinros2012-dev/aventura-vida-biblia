# Arquitectura — Aventura Vida

## Decisiones técnicas

| Área | Decisión | Motivo |
| --- | --- | --- |
| Aplicación | Next.js App Router + TypeScript estricto | Rutas, renderizado eficiente, escalabilidad y buen soporte PWA futuro. |
| Estilos | Tailwind CSS + variables CSS de diseño | Consistencia visual, diseño responsive y componentes sencillos de mantener. |
| Datos | PostgreSQL + Prisma | Relaciones tipadas, migraciones y consultas mantenibles. |
| Validación futura | Zod en límites de servidor | Validar entradas antes de persistir o conceder recompensas. |
| Autenticación futura | Auth.js con adaptador Prisma | Sesiones seguras y roles del servidor para jugador/administrador. |
| Juegos | Registro interno de juegos + adaptador por juego | El shell monta módulos revisados desde una clave, sin incrustarlos en las páginas. |
| Progreso de demostración | Provider React + `localStorage` | Permite probar UX de puntos, XP, rachas, logros y perfil sin recopilar información del menor. |

## Estructura de carpetas

```text
app/                    Rutas, layouts y páginas públicas
components/             Componentes de UI reutilizables y componentes de dominio
lib/                    Datos demo, utilidades, configuraciones y acceso a datos futuro
prisma/                 Esquema PostgreSQL y seed de desarrollo
types/                  Tipos compartidos
game-modules/           Reservado para módulos de juegos internos
```

## Modelo de datos

El esquema `prisma/schema.prisma` incluye las entidades solicitadas: usuarios y perfiles, categorías y juegos, sesiones/progreso, puntuaciones y XP, misiones y su progreso, logros, aventuras/capítulos, recompensas, notificaciones, ajustes y auditoría.

Principios principales:

- `User` conserva identidad y rol; `Profile` conserva la identidad pública del menor (nickname/avatar). Los rankings usan `Profile.nickname`, nunca correo ni nombre real.
- `Game` es contenido editorial y no almacena JavaScript subido. Sus estados (`DRAFT`, `PUBLISHED`, `ARCHIVED`) separan borradores de contenido público.
- Las futuras operaciones de puntos se registran en transacciones inmutables (`Score`, `XpTransaction`, `Reward`) y el servidor será su fuente de verdad.
- Los índices cubren catálogo publicado, sesiones por usuario/juego, puntuaciones por periodo y progreso de misiones.

## Arquitectura de juegos actual y futura

Cada juego interno se registra con metadatos y una clave (`word-search`, `coloring`, `quiz`, `story`, `memory`, `iq`, `verse` o `puzzle`). `GamePlayer` resuelve esa clave en un módulo de `components/games`; todos se ejecutan dentro de `GameShell`, que entrega estados de carga, error y victoria. Ningún módulo accede a Prisma, secretos ni rutas administrativas.

Durante esta demostración, `PlayerProgressProvider` conserva únicamente métricas de juego no personales en `localStorage`: puntos, XP, racha, identificadores de juegos terminados, logros y versículos practicados. No es una fuente de verdad ni debe usarse para un ranking real.

El futuro Game SDK será una capa de API autenticada del servidor: abrirá una sesión, aceptará eventos permitidos, verificará reglas del juego y finalmente calculará puntos/XP/recompensas. Sustituirá el guardado local; los valores enviados desde el navegador nunca serán autoridad.

Paquetes HTML5 de terceros no se ejecutarán en el dominio principal. Requerirán una revisión de confianza y aislamiento con `iframe sandbox` y un origen separado, comunicándose con la plataforma únicamente mediante mensajes con un contrato estricto.

## Seguridad prevista por fases

- Autorización basada en roles exclusivamente en el servidor.
- Separación entre datos privados y campos públicos de perfil.
- Sin chat ni mensajería privada en el lanzamiento inicial.
- Validación de formularios, límite de tasa y logs auditables para administración.
- Secretos sólo en variables de entorno; `.env.example` no contiene valores reales.
