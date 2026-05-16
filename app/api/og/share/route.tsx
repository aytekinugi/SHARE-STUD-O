import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") ?? "Vanguard Quest").slice(0, 72);
  const level = (searchParams.get("level") ?? "1").slice(0, 6);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 64,
          background: "linear-gradient(145deg, #0a0a0a 0%, #1a1408 50%, #0a0a0a 100%)",
          color: "#f5f5f5",
          fontFamily: "system-ui, sans-serif"
        }}
      >
        <div style={{ fontSize: 28, color: "#e5b868", letterSpacing: 6, textTransform: "uppercase" }}>
          Vanguard AI
        </div>
        <div style={{ fontSize: 56, fontWeight: 800, marginTop: 24, lineHeight: 1.15, maxWidth: 1000 }}>{title}</div>
        <div style={{ fontSize: 32, marginTop: 32, color: "#a8a29e" }}>Level {level}</div>
      </div>
    ),
    { width: 1200, height: 630 }
  );
}
