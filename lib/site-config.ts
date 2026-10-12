/**
 * Dirección pública única de Aventura Vida Biblia. `NEXT_PUBLIC_APP_URL`
 * permite cambiar a un dominio propio sin editar componentes; el respaldo es
 * la dirección pública actual, nunca la dirección local de desarrollo.
 */
const fallbackUrl = "https://aventura-vida-biblia.vercel.app";

function validPublicUrl(value: string | undefined) {
  if (!value) return undefined;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url : undefined;
  } catch {
    return undefined;
  }
}

export const publicSiteUrl = (validPublicUrl(process.env.NEXT_PUBLIC_APP_URL)?.origin ?? fallbackUrl);

export const publicSiteName = "Aventura Vida Biblia";
export const publicShareText = "Descubre juegos, aventuras y valores para toda la familia en Aventura Vida Biblia · Proyecto Vida Kids.";
