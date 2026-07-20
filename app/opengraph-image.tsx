import { ImageResponse } from "next/og";

export const alt = "Club Duels — pick your favorite club, duel by duel";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: 28,
          background: "linear-gradient(135deg, #0a0a0a 0%, #1a2e1a 100%)",
          color: "#fafafa",
        }}
      >
        <div style={{ fontSize: 130 }}>⚽</div>
        <div style={{ fontSize: 92, fontWeight: 700, letterSpacing: -2 }}>Club Duels</div>
        <div style={{ fontSize: 34, color: "#9ca3af" }}>
          Pick your favorite club — duel by duel
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            marginTop: 20,
            fontSize: 28,
            color: "#4ade80",
          }}
        >
          <div style={{ width: 14, height: 14, borderRadius: 7, background: "#4ade80" }} />
          Open games waiting for your pick
        </div>
      </div>
    ),
    size,
  );
}
