import { appIconResponse } from "@/lib/pwa/app-icon";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

/** Ícono de aplicación de marca; no representa a ningún personaje oficial. */
export default function Icon() {
  return appIconResponse(512);
}
