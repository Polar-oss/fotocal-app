import type { MetadataRoute } from "next";
import { getAppUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = getAppUrl();
  const lastModified = new Date();

  return [
    {
      changeFrequency: "weekly",
      lastModified,
      priority: 1,
      url: `${appUrl}/`,
    },
    {
      changeFrequency: "weekly",
      lastModified,
      priority: 0.9,
      url: `${appUrl}/pricing`,
    },
    {
      changeFrequency: "weekly",
      lastModified,
      priority: 0.8,
      url: `${appUrl}/sign-up`,
    },
    {
      changeFrequency: "weekly",
      lastModified,
      priority: 0.7,
      url: `${appUrl}/sign-in`,
    },
  ];
}
