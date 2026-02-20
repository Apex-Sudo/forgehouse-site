import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "ForgeHouse - Your favorite mentor is fully booked. Their agent isn't.";
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
              background: "#3B82F6",
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
            <span style={{ color: "#3B82F6" }}>Forge</span>House
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
          Your favorite mentor is{" "}
          <span style={{ color: "#3B82F6" }}>fully booked</span>.
          <br />
          Their agent isn&apos;t.
        </div>

        {/* Subtitle */}
        <div style={{ fontSize: "24px", color: "#737373", lineHeight: 1.5 }}>
          Founder-trained AI agents you can talk to anytime.
        </div>
      </div>
    ),
    { ...size }
  );
}
