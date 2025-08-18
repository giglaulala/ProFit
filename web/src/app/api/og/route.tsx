import { ImageResponse } from "next/og";

export const runtime = "edge";

export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          height: "100%",
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "linear-gradient(135deg,#E2FF00,#8b5cf6)",
        }}
      >
        <div style={{ fontSize: 64, fontWeight: 800 }}>ProFit</div>
      </div>
    )
  );
}
