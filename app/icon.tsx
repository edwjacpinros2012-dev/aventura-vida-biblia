import { ImageResponse } from "next/og";

export const size = { width: 512, height: 512 };
export const contentType = "image/png";

/** Ícono de aplicación de marca; no representa a ningún personaje oficial. */
export default function Icon() {
  return new ImageResponse(
    <div style={{ alignItems: "center", background: "linear-gradient(145deg, #0d6572, #061923 68%)", border: "22px solid #f5bd4d", color: "#f5e5b9", display: "flex", fontFamily: "Arial, sans-serif", fontSize: 142, fontWeight: 900, height: "100%", justifyContent: "center", letterSpacing: -12, textShadow: "0 8px 0 #063542", width: "100%" }}>AV</div>,
    size,
  );
}
