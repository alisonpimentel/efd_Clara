import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://efd-clara.vercel.app";
  const lastModified = new Date("2026-07-30T00:00:00-03:00");

  return [
    {
      url: siteUrl,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${siteUrl}/metodologia`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/privacidade`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.4,
    },
  ];
}
