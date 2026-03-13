import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ForgeHouse - Expert Knowledge on Demand";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "#0A0A0A",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px 80px",
        }}
      >
        {/* Subtle gradient accent */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: "linear-gradient(90deg, transparent, #B8916A, transparent)",
          }}
        />

        {/* Logo / Brand */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "40px",
              height: "40px",
              background: "#B8916A",
              borderRadius: "10px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "20px",
              fontWeight: 800,
              color: "#0A0A0A",
            }}
          >
            F
          </div>
          <span
            style={{
              fontSize: "24px",
              fontWeight: 600,
              color: "#EDEDED",
              letterSpacing: "0.5px",
            }}
          >
            ForgeHouse
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: "64px",
            fontWeight: 800,
            color: "#EDEDED",
            textAlign: "center",
            lineHeight: 1.1,
            marginBottom: "8px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <span>Expert knowledge</span>
          <span style={{ color: "#B8916A" }}>on demand.</span>
        </div>

        {/* Subheader */}
        <div
          style={{
            fontSize: "24px",
            color: "#737373",
            textAlign: "center",
            marginTop: "16px",
          }}
        >
          Real expertise, delivered by AI.
        </div>

        {/* URL */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            fontSize: "18px",
            color: "#555",
            letterSpacing: "1px",
          }}
        >
          forgehouse.io
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
