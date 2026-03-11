import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ForgeHouse - Expert Knowledge for Your Agent";
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
          justifyContent: "center",
          padding: "80px",
        }}
      >
        {/* Logo */}
        <div style={{ display: "flex", alignItems: "center", marginBottom: "40px" }}>
          <div
            style={{
              width: "48px",
              height: "48px",
              borderRadius: "10px",
              background: "#B8916A",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginRight: "16px",
              fontSize: "24px",
              color: "white",
              fontWeight: "bold",
            }}
          >
            F
          </div>
          <span style={{ fontSize: "28px", color: "#EDEDED", fontWeight: "bold" }}>
            <span style={{ color: "#B8916A" }}>Forge</span>House
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontSize: "56px",
            fontWeight: "bold",
            color: "#EDEDED",
            lineHeight: 1.15,
            marginBottom: "24px",
          }}
        >
          AI agents trained by{" "}
          <span style={{ color: "#B8916A" }}>real mentors</span>.
          <br />
          Available anytime.
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: "24px", color: "#737373", lineHeight: 1.5 }}>
          Get clarity on your next move, whenever you need it.
        </div>
      </div>
    ),
    { ...size }
  );
}
