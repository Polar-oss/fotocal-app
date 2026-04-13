import type { Metadata, Viewport } from "next";
import { PwaRegister } from "@/components/pwa-register";
import { getBaseUrl } from "@/lib/site";
import "./globals.css";

const baseUrl = getBaseUrl();

export const metadata: Metadata = {
  applicationName: "FotoCal",
  title: "FotoCal",
  description:
    "FotoCal e um app focado em foto da refeicao, meta calorica e rotina alimentar simples.",
  metadataBase: baseUrl,
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "FotoCal",
  },
  formatDetection: {
    address: false,
    date: false,
    email: false,
    telephone: false,
  },
  manifest: "/manifest.webmanifest",
  other: {
    "mobile-web-app-capable": "yes",
  },
  openGraph: {
    description:
      "Tire uma foto da refeicao, acompanhe calorias e veja seu dia fechar com mais clareza.",
    siteName: "FotoCal",
    title: "FotoCal",
    type: "website",
    url: baseUrl,
  },
  twitter: {
    card: "summary_large_image",
    description:
      "Tire uma foto da refeicao, acompanhe calorias e veja seu dia fechar com mais clareza.",
    title: "FotoCal",
  },
};

export const viewport: Viewport = {
  initialScale: 1,
  maximumScale: 1,
  themeColor: "#050505",
  viewportFit: "cover",
  width: "device-width",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="h-full antialiased">
      <body className="min-h-full bg-black text-white">
        <PwaRegister />
        {children}
      </body>
    </html>
  );
}
