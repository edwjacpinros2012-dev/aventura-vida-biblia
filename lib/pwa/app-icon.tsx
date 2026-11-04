import { ImageResponse } from "next/og";

export function appIconResponse(size: number, maskable = false) {
  const inset = maskable ? Math.round(size * 0.12) : Math.round(size * 0.045);
  return new ImageResponse(
    <div style={{ alignItems: "center", background: "linear-gradient(145deg, #0d6572, #061923 68%)", border: `${inset}px solid #f5bd4d`, boxSizing: "border-box", color: "#f5e5b9", display: "flex", fontFamily: "Arial, sans-serif", fontSize: Math.round(size * 0.28), fontWeight: 900, height: "100%", justifyContent: "center", letterSpacing: Math.round(size * -0.024), textShadow: `0 ${Math.round(size * 0.016)}px 0 #063542`, width: "100%" }}>AV</div>,
    { width: size, height: size },
  );
}
