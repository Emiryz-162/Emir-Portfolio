import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";
import { profile } from "@/data/profile";

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        background: "#080807",
        color: "#f3f1ec",
        fontFamily: "Arial",
        padding: 56,
      }}
    >
      <div
        style={{
          width: "100%",
          border: "1px solid rgba(255,255,255,0.16)",
          borderRadius: 10,
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 48,
          background: "#10100f",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <span style={{ color: "#c47a43", fontSize: 28 }}>EY</span>
          <span style={{ color: "#8d8a84", fontSize: 24 }}>
            {siteConfig.shortName}
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <h1 style={{ margin: 0, fontSize: 84, letterSpacing: 0 }}>
            {profile.shortName}
          </h1>
          <p style={{ marginTop: 22, color: "#c8c5bd", fontSize: 38 }}>
            {profile.role}
          </p>
        </div>
        <div style={{ display: "flex", gap: 18, color: "#8d8a84" }}>
          <span>Frontend</span>
          <span>Backend</span>
          <span>REST API</span>
          <span>Database</span>
        </div>
      </div>
    </div>,
    size,
  );
}
