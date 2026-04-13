import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  const appUrl = getAppUrl();

  return {
    host: appUrl,
    rules: {
      allow: "/",
      disallow: ["/api/", "/auth/", "/set-goal"],
      userAgent: "*",
    },
    sitemap: `${appUrl}/sitemap.xml`,
  };
}
