import { ImageResponse } from "next/og";

export const size = {
  width: 32,
  height: 32,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    <div
      style={{
        alignItems: "center",
        background: "#080807",
        color: "#f3f1ec",
        display: "flex",
        fontFamily: "Arial",
        fontSize: 15,
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
