import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "192.168.6.87", "localhost"],
  distDir: process.env.NEXT_DIST_DIR || ".next",
  images: {
    remotePatterns: [
      {
        hostname: "**.supabase.co",
        protocol: "https",
      },
    ],
  },
};

export default nextConfig;
