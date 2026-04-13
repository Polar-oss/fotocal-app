import { ImageResponse } from "next/og";

export const size = {
  height: 180,
  width: 180,
};

export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "radial-gradient(circle at top left, rgba(16,185,129,0.28), transparent 38%), linear-gradient(180deg, #020202 0%, #050505 100%)",
          borderRadius: 42,
          display: "flex",
          height: "100%",
          justifyContent: "center",
          width: "100%",
        }}
      >
        <div
          style={{
            alignItems: "center",
            background: "linear-gradient(180deg, #10b981 0%, #047857 100%)",
            borderRadius: 42,
            boxShadow: "0 18px 44px rgba(16, 185, 129, 0.25)",
            color: "white",
            display: "flex",
            fontFamily: "Avenir Next, Arial, sans-serif",
            fontSize: 92,
            fontWeight: 700,
            height: 118,
            justifyContent: "center",
            letterSpacing: "-0.08em",
            width: 118,
          }}
        >
          F
        </div>
      </div>
    ),
    size,
  );
}
