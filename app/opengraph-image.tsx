import { ImageResponse } from "next/og";

export const alt = "Aventura Vida Biblia · Proyecto Vida Kids";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Vista previa original para enlaces de WhatsApp y otras redes compatibles. */
export default function OpenGraphImage() {
  return new ImageResponse(
    <div style={{ alignItems: "center", background: "radial-gradient(circle at 82% 16%, #f5bd4d55, transparent 22%), radial-gradient(circle at 20% 80%, #10a8a055, transparent 29%), linear-gradient(135deg, #0d6572, #061923 62%)", color: "#f5e5b9", display: "flex", fontFamily: "Arial, sans-serif", height: "100%", justifyContent: "center", padding: 72, position: "relative", width: "100%" }}>
      <div style={{ border: "3px solid #f5bd4d", borderRadius: 38, display: "flex", flexDirection: "column", height: "100%", justifyContent: "center", padding: "48px 56px", width: "100%" }}>
        <div style={{ color: "#67e5e0", display: "flex", fontSize: 28, fontWeight: 800, letterSpacing: 5, textTransform: "uppercase" }}>PROYECTO VIDA KIDS</div>
        <div style={{ display: "flex", fontSize: 88, fontWeight: 900, letterSpacing: -4, lineHeight: 1.02, marginTop: 26 }}>AVENTURA VIDA</div>
        <div style={{ color: "#f5bd4d", display: "flex", fontSize: 48, fontWeight: 800, marginTop: 10 }}>BIBLIA</div>
        <div style={{ color: "#ffffffcc", display: "flex", fontSize: 29, marginTop: 34 }}>Juega · Descubre · Aprende · Vive</div>
      </div>
    </div>,
    size,
  );
}
