import { ImageResponse } from "next/og";

export const alt = "GenBI Jawa Timur - Energi Baru untuk Indonesia";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Kartu Open Graph default untuk seluruh halaman publik. */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "96px",
          backgroundColor: "#0a1628",
          backgroundImage:
            "radial-gradient(circle at 15% 15%, rgba(59,130,246,0.45), transparent 45%), radial-gradient(circle at 85% 80%, rgba(30,64,175,0.5), transparent 50%)",
          color: "#f8fafc",
        }}
      >
        <div style={{ fontSize: 28, letterSpacing: 6, color: "#93c5fd", textTransform: "uppercase" }}>
          Generasi Baru Indonesia
        </div>
        <div style={{ fontSize: 84, fontWeight: 700, marginTop: 24, lineHeight: 1.1 }}>
          GenBI Jawa Timur
        </div>
        <div style={{ fontSize: 40, color: "#bfdbfe", marginTop: 24 }}>
          Energi Baru untuk Indonesia
        </div>
      </div>
    ),
    size,
  );
}
