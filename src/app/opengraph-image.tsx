import { ImageResponse } from "next/og";

export const size = {
  height: 630,
  width: 1200,
};

export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          alignItems: "stretch",
          background:
            "radial-gradient(circle at top left, rgba(16,185,129,0.25), transparent 28%), radial-gradient(circle at 85% 10%, rgba(245,158,11,0.12), transparent 20%), linear-gradient(180deg, #020202 0%, #050505 100%)",
          color: "#ffffff",
          display: "flex",
          fontFamily: "Avenir Next, Arial, sans-serif",
          height: "100%",
          justifyContent: "space-between",
          padding: "68px 72px",
          width: "100%",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            maxWidth: "760px",
          }}
        >
          <div
            style={{
              alignItems: "center",
              display: "flex",
              gap: 18,
            }}
          >
            <div
              style={{
                alignItems: "center",
                background: "linear-gradient(180deg, #10b981 0%, #047857 100%)",
                borderRadius: 28,
                boxShadow: "0 24px 54px rgba(16, 185, 129, 0.24)",
                display: "flex",
                fontSize: 48,
                fontWeight: 700,
                height: 78,
                justifyContent: "center",
                letterSpacing: "-0.08em",
                width: 78,
              }}
            >
              F
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
              }}
            >
              <span
                style={{
                  fontSize: 40,
                  fontWeight: 700,
                }}
              >
                FotoCal
              </span>
              <span
                style={{
                  color: "rgba(255,255,255,0.62)",
                  fontSize: 20,
                }}
              >
                calorias por foto, com experiencia leve
              </span>
            </div>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 22,
            }}
          >
            <span
              style={{
                color: "#86efac",
                fontSize: 22,
                fontWeight: 700,
                letterSpacing: "0.24em",
                textTransform: "uppercase",
              }}
            >
              rotina alimentar leve
            </span>
            <span
              style={{
                fontSize: 70,
                fontWeight: 700,
                letterSpacing: "-0.07em",
                lineHeight: 1,
              }}
            >
              Tire uma foto da refeicao e entenda melhor o seu dia.
            </span>
            <span
              style={{
                color: "rgba(255,255,255,0.74)",
                fontSize: 28,
                lineHeight: 1.35,
              }}
            >
              Estimativa por foto, meta calorica, historico e um fluxo simples
              para usar no celular.
            </span>
          </div>
        </div>

        <div
          style={{
            alignSelf: "flex-end",
            background: "rgba(255,255,255,0.05)",
            border: "1px solid rgba(255,255,255,0.12)",
            borderRadius: 38,
            display: "flex",
            flexDirection: "column",
            gap: 16,
            minWidth: 280,
            padding: "28px 26px",
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.64)",
              fontSize: 18,
            }}
          >
            Total do dia
          </span>
          <span
            style={{
              fontSize: 42,
              fontWeight: 700,
              letterSpacing: "-0.05em",
            }}
          >
            1.420 kcal
          </span>
          <span
            style={{
              color: "#86efac",
              fontSize: 20,
              fontWeight: 600,
            }}
          >
            Meta restante 580 kcal
          </span>
        </div>
      </div>
    ),
    size,
  );
}
