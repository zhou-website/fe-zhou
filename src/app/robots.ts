import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://www.zhouconsulting.id";

  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/layanan/",
          "/layanan/*",
          "/edukasi",
          "/peraturan",
          "/karir",
          "/belajar-pajak",
          "/kontak",
          "/images/",
          "/images/*",
        ],
        disallow: [
          "/dashboard/",
          "/dashboard/*",
          "/api/",
          "/api/*",
          "/reset-password",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
