# Assets oficiales de personajes

Esta carpeta está reservada exclusivamente para material oficial entregado por Proyecto Vida Kids.

No incluya arte temporal, generado por IA ni recursos sin autorización.

## Convención por personaje

Para un personaje con identificador `nombre-del-personaje`, copie los archivos a:

```text
public/assets/proyecto-vida-kids/characters/nombre-del-personaje/
  full.png       # ilustración completa
  avatar.png     # recorte cuadrado para perfil, ranking, salas y PvP
  thumbnail.png  # miniatura para colección, tienda e inventario
```

Después agregue una única entrada con ese mismo `id` en
`lib/characters/catalog.ts`, usando estas URLs públicas:

```ts
{
  id: "nombre-del-personaje",
  name: "Nombre oficial",
  description: "Descripción aprobada",
  asset: "/assets/proyecto-vida-kids/characters/nombre-del-personaje/full.png",
  avatar: "/assets/proyecto-vida-kids/characters/nombre-del-personaje/avatar.png",
  thumbnail: "/assets/proyecto-vida-kids/characters/nombre-del-personaje/thumbnail.png",
  status: "active",
  metadata: { version: 1 },
}
```

Al marcar la entrada como `active`, el mismo `id` puede guardarse en `Profile.avatarKey` y se resolverá automáticamente en las vistas que usan `CharacterAvatar`.

## Láminas oficiales recibidas

Las láminas originales entregadas el 15 de septiembre de 2026 se conservan sin
cambios en `source-sheets/`. Las carpetas `vida-kids-01-*` a
`vida-kids-06-*` contienen recortes derivados para su uso en la interfaz. Sus
claves son descripciones neutrales, no nombres de personajes: se podrán
renombrar en el catálogo cuando Proyecto Vida Kids entregue los nombres
oficiales.
