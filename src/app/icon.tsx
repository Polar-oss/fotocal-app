import { ImageResponse } from "next/og";

export const size = {
  height: 512,
  width: 512,
};

export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "center",
          background:
            "radial-gradient(circle at top left, rgba(16,185,129,0.35), transparent 40%), linear-gradient(180deg, #020202 0%, #050505 100%)",
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
            borderRadius: 120,
            boxShadow: "0 35px 80px rgba(16, 185, 129, 0.28)",
            color: "white",
            display: "flex",
            fontFamily: "Avenir Next, Arial, sans-serif",
            fontSize: 240,
            fontWeight: 700,
            height: 320,
            justifyContent: "center",
            letterSpacing: "-0.08em",
            width: 320,
          }}
        >
          F
        </div>
      </div>
    ),
    size,
  );
}
