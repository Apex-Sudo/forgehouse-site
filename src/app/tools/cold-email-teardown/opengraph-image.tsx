import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Cold Email Teardown — Get Your Email Rewritten Line by Line";
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
          <span style={{ fontSize: "20px", color: "#525252", marginLeft: "16px" }}>Free Tool</span>
        </div>
        <div
          style={{
            fontSize: "52px",
            fontWeight: "bold",
            color: "#EDEDED",
            lineHeight: 1.15,
            marginBottom: "24px",
          }}
        >
          Your cold email, <span style={{ color: "#B8916A" }}>torn apart</span>
          <br />
          and rewritten.
        </div>
        <div style={{ fontSize: "24px", color: "#737373", lineHeight: 1.5 }}>
          Line-by-line diagnosis using Problem-Impact-Proof. Free.
        </div>
      </div>
    ),
    { ...size }
  );
}
