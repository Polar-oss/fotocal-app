import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    background_color: "#050505",
    categories: ["food", "health", "lifestyle"],
    description:
      "Tire uma foto da refeicao, acompanhe calorias e veja seu dia fechar com mais clareza.",
    display: "standalone",
    icons: [
      {
        purpose: "any",
        sizes: "192x192",
        src: "/icon?size=192",
        type: "image/png",
      },
      {
        purpose: "any",
        sizes: "512x512",
        src: "/icon?size=512",
        type: "image/png",
      },
      {
        purpose: "maskable",
        sizes: "512x512",
        src: "/icon?size=512",
        type: "image/png",
      },
      {
        sizes: "180x180",
        src: "/apple-icon",
        type: "image/png",
      },
    ],
    lang: "pt-BR",
    name: "FotoCal",
    orientation: "portrait",
    scope: "/",
    short_name: "FotoCal",
    start_url: "/app",
    theme_color: "#050505",
  };
}
