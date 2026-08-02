import { ImageResponse } from "next/og";

export const size = {
  width: 180,
  height: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#080807",
        border: "8px solid #c47a43",
        color: "#f3f1ec",
        display: "flex",
        fontFamily: "Arial",
        fontSize: 68,
        fontWeight: 700,
        height: "100%",
        justifyContent: "center",
        width: "100%",
      }}
    >
      EY
    </div>,
    size,
  );
}
